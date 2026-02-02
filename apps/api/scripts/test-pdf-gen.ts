
import { Test, TestingModule } from '@nestjs/testing';
import { ReportGeneratorService } from '../src/services/report-generator.service';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
    const module: TestingModule = await Test.createTestingModule({
        providers: [ReportGeneratorService],
    }).compile();

    const service = module.get<ReportGeneratorService>(ReportGeneratorService);

    const mockVisit = {
        id: 'test-visit-uuid',
        fullName: 'Juan Perez',
        citizenId: '12345678',
        addressText: 'Vereda La Esperanza',
        status: 'COMPLETED',
        priority: 'HIGH',
        logs: [
            { timestamp: new Date(), action: 'CHECK_IN' },
            { timestamp: new Date(), action: 'EVIDENCE_UPLOAD' }
        ],
        assignedTo: { fullName: 'Gestor Test' },
        region: { name: 'Region Norte' }
    };

    try {
        console.log('Generating PDF...');
        const buffer = await service.generateVisitReport(mockVisit);
        const outputPath = path.join(__dirname, 'test-report.pdf');
        fs.writeFileSync(outputPath, buffer);
        console.log(`PDF generated successfully at: ${outputPath}`);
        console.log(`Size: ${buffer.length} bytes`);
    } catch (error) {
        console.error('PDF Generation Failed:', error);
        process.exit(1);
    }
}

run();
