
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.19.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  ipAddress: 'ipAddress',
  metadata: 'metadata',
  timestamp: 'timestamp'
};

exports.Prisma.RegionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code'
};

exports.Prisma.MunicipalityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  regionId: 'regionId'
};

exports.Prisma.VeredaScalarFieldEnum = {
  id: 'id',
  name: 'name',
  municipalityId: 'municipalityId'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  fullName: 'fullName',
  dni: 'dni',
  phone: 'phone',
  role: 'role',
  isActive: 'isActive',
  permissions: 'permissions',
  regionId: 'regionId',
  municipalityId: 'municipalityId',
  createdAt: 'createdAt',
  lastLogin: 'lastLogin',
  acceptedTerms: 'acceptedTerms',
  acceptedAt: 'acceptedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  url: 'url',
  version: 'version',
  hash: 'hash',
  uploaderId: 'uploaderId',
  regionId: 'regionId',
  createdAt: 'createdAt'
};

exports.Prisma.DocumentCommentScalarFieldEnum = {
  id: 'id',
  documentId: 'documentId',
  userId: 'userId',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.RegionalReportScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  regionId: 'regionId',
  municipalityId: 'municipalityId',
  category: 'category',
  priority: 'priority',
  title: 'title',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.AlertScalarFieldEnum = {
  id: 'id',
  reportId: 'reportId',
  priority: 'priority',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  code: 'code',
  type: 'type',
  format: 'format',
  url: 'url',
  hashSha256: 'hashSha256',
  generatedById: 'generatedById',
  authorizedById: 'authorizedById',
  regionId: 'regionId',
  municipalityId: 'municipalityId',
  metadata: 'metadata',
  generatedAt: 'generatedAt'
};

exports.Prisma.ReportDeliveryScalarFieldEnum = {
  id: 'id',
  reportId: 'reportId',
  recipient: 'recipient',
  channel: 'channel',
  status: 'status',
  sentAt: 'sentAt'
};

exports.Prisma.NewsReadReceiptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  reportId: 'reportId',
  readAt: 'readAt'
};

exports.Prisma.VisitScalarFieldEnum = {
  id: 'id',
  source: 'source',
  reliability: 'reliability',
  citizenId: 'citizenId',
  fullName: 'fullName',
  addressText: 'addressText',
  phone: 'phone',
  latitude: 'latitude',
  longitude: 'longitude',
  gpsAccuracy: 'gpsAccuracy',
  verifiedAt: 'verifiedAt',
  status: 'status',
  priority: 'priority',
  regionId: 'regionId',
  municipalityId: 'municipalityId',
  vereda: 'vereda',
  assignedToId: 'assignedToId',
  assignedById: 'assignedById',
  assignedAt: 'assignedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VisitLogScalarFieldEnum = {
  id: 'id',
  visitId: 'visitId',
  userId: 'userId',
  action: 'action',
  metadata: 'metadata',
  timestamp: 'timestamp'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  ADMIN: 'ADMIN',
  COORDINATOR: 'COORDINATOR',
  GESTOR: 'GESTOR',
  USER: 'USER',
  SUPPORT: 'SUPPORT'
};

exports.NewsCategory = exports.$Enums.NewsCategory = {
  CLIMATE: 'CLIMATE',
  SECURITY: 'SECURITY',
  PUBLIC_ORDER: 'PUBLIC_ORDER',
  HEALTH: 'HEALTH',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  OTHER: 'OTHER'
};

exports.Priority = exports.$Enums.Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

exports.ReportType = exports.$Enums.ReportType = {
  GENERAL: 'GENERAL',
  REGIONAL: 'REGIONAL',
  ALERT: 'ALERT',
  AUDIT: 'AUDIT'
};

exports.ReportFormat = exports.$Enums.ReportFormat = {
  PDF: 'PDF',
  XLSX: 'XLSX',
  DOCX: 'DOCX'
};

exports.DeliveryChannel = exports.$Enums.DeliveryChannel = {
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  DOWNLOAD: 'DOWNLOAD'
};

exports.VisitSource = exports.$Enums.VisitSource = {
  MASSIVE: 'MASSIVE',
  MANUAL: 'MANUAL',
  ENRICHED: 'ENRICHED'
};

exports.VisitReliability = exports.$Enums.VisitReliability = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

exports.VisitStatus = exports.$Enums.VisitStatus = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  VERIFIED: 'VERIFIED',
  CANCELLED: 'CANCELLED'
};

exports.Prisma.ModelName = {
  AuditLog: 'AuditLog',
  Region: 'Region',
  Municipality: 'Municipality',
  Vereda: 'Vereda',
  User: 'User',
  Document: 'Document',
  DocumentComment: 'DocumentComment',
  RegionalReport: 'RegionalReport',
  Alert: 'Alert',
  Report: 'Report',
  ReportDelivery: 'ReportDelivery',
  NewsReadReceipt: 'NewsReadReceipt',
  Visit: 'Visit',
  VisitLog: 'VisitLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
