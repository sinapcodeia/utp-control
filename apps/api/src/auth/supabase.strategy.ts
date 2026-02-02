import { Injectable, Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(SupabaseStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseJwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
    const supabasePublicKey = configService.get<string>('SUPABASE_PUBLIC_KEY')?.replace(/\\n/g, '\n');

    // Configurar JWKS Client as fallback

    const jwksProvider = passportJwtSecret({
      cache: true,
      rateLimit: false,
      jwksRequestsPerMinute: 100,
      jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      handleSigningKeyError: (err, cb) => {
        console.error('❌ JWKS Signing Key Error:', err);
        cb(err);
      }
    });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['HS256', 'RS256', 'ES256'],
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        try {
          const parts = rawJwtToken.split('.');
          if (parts.length < 2) return done(new Error('Invalid token format'));

          const headerJson = Buffer.from(parts[0], 'base64').toString();
          const header = JSON.parse(headerJson);

          Logger.log(`Processing JWT with ALG: ${header.alg}`);

          // 1. HS256 - Usar secreto local
          if (header.alg === 'HS256') {
            return done(null, supabaseJwtSecret);
          }

          // 2. RS256/ES256 - Priorizar Public Key local (más rápido y evita 401 de JWKS)
          if ((header.alg === 'RS256' || header.alg === 'ES256') && supabasePublicKey) {
            Logger.log('Using local Public Key for verification');
            return done(null, supabasePublicKey);
          }

          // 3. Fallback a JWKS fetch
          Logger.log('Falling back to JWKS provider');
          jwksProvider(request, rawJwtToken, done);
        } catch (e) {
          console.error('❌ Error inside secretOrKeyProvider:', e);
          done(e);
        }
      },
    });

    // Configurar JWKS Client as fallback - Logs moved after super()
    this.logger.log(`Initializing SupabaseStrategy with URL: ${supabaseUrl}`);
    this.logger.log(`Public Key configured: ${!!supabasePublicKey}`);

    this.logger.log(`Auth Strategy Initialized (Hybrid: HS256 + JWKS)`);
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    try {
      this.logger.log(`Validating auth payload for SUB: ${payload.sub}`);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          region: true,
          municipality: true,
          assignedRegions: true,
          assignedMunicipalities: true,
          assignedVeredas: true
        }
      });

      if (!user) {
        this.logger.error(`❌ USER NOT FOUND IN DB. SUB: ${payload.sub}`);
        return null;
      }

      if (!user.isActive) {
        this.logger.warn(`❌ USER INACTIVE: ${user.email}`);
        throw new UnauthorizedException('User account is inactive');
      }

      this.logger.log(`✅ Auth Success: ${user.email} (${user.role})`);

      let permissions = user.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = {};
        }
      }

      return {
        ...user,
        permissions: permissions || {},
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('💥 CRITICAL AUTH ERROR:', error);
      throw new InternalServerErrorException(`Server error during auth: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}
