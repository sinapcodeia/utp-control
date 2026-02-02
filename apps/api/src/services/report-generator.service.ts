
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Visit } from '@prisma/client';

@Injectable()
export class ReportGeneratorService {

    async generateVisitReport(visit: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            doc.on('error', (err) => {
                reject(err);
            });

            // Header
            this.drawHeader(doc);

            // Title
            doc.moveDown(2);
            doc.fontSize(20).font('Helvetica-Bold').text('INFORME TÉCNICO DE VISITA DE CAMPO', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').fillColor('grey').text(`ID: ${visit.id}`, { align: 'center' });
            doc.moveDown(2);

            // Info Grid
            const startY = doc.y;

            this.drawField(doc, 'Fecha:', new Date().toLocaleDateString(), 50, startY);
            this.drawField(doc, 'Gestor:', visit.assignedTo?.fullName || 'N/A', 300, startY);

            doc.moveDown(1);
            const nextY = doc.y;
            this.drawField(doc, 'Estado Visita:', visit.status || 'N/A', 50, nextY);
            this.drawField(doc, 'Prioridad:', visit.priority || 'NORMAL', 300, nextY);

            doc.moveDown(2);

            // Content Section
            doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Detalles del Productor', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica').text(`Nombre: ${visit.fullName || 'N/A'}`);
            doc.text(`Cédula: ${visit.citizenId || 'N/A'}`);
            doc.text(`Dirección: ${visit.addressText || 'N/A'}`);
            doc.text(`Región: ${visit.region?.name || 'N/A'}`);

            doc.moveDown(2);

            // Observations
            if (visit.logs && visit.logs.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Bitácora de Eventos', { underline: true });
                doc.moveDown(0.5);
                visit.logs.forEach((log: any) => {
                    doc.fontSize(10).font('Helvetica').text(`[${new Date(log.timestamp).toLocaleString()}] ${log.action}`);
                });
            }

            // Footer
            this.drawFooter(doc);

            doc.end();
        });
    }

    private drawHeader(doc: PDFKit.PDFDocument) {
        // Mock Logo placeholder
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#0F172A').text('UTP CONTROL', 50, 50);
        doc.fontSize(10).font('Helvetica').fillColor('#64748B').text('SISTEMA DE GESTIÓN TERRITORIAL', 50, 75);

        // Line separator
        doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#E2E8F0').lineWidth(2).stroke();
    }

    private drawFooter(doc: PDFKit.PDFDocument) {
        const bottom = doc.page.height - 50;
        doc.moveTo(50, bottom - 20).lineTo(550, bottom - 20).strokeColor('#E2E8F0').lineWidth(1).stroke();

        doc.fontSize(8).fillColor('#94A3B8').text(
            'Este documento fue generado automáticamente por UTP Control. La información contenida es confidencial.',
            50,
            bottom,
            { align: 'center', width: 500 }
        );
    }

    async generateExecutiveReport(stats: any, period: string, managerInfo: { name: string, email: string }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // --- PORTADA PREMIUM ---
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0F172A'); // Dark Blue background

            // Decorative elements
            doc.circle(doc.page.width, 0, 200).fillOpacity(0.1).fill('#3B82F6');
            doc.circle(0, doc.page.height, 150).fillOpacity(0.05).fill('#10B981');
            doc.fillOpacity(1);

            doc.fontSize(36).font('Helvetica-Bold').fillColor('white').text('INFORME EJECUTIVO', 0, 320, { align: 'center' });
            doc.fontSize(18).font('Helvetica').fillColor('#94A3B8').text('OPERACIÓN TERRITORIAL Y COBERTURA', 0, 370, { align: 'center' });

            doc.moveTo(250, 420).lineTo(350, 420).strokeColor('#3B82F6').lineWidth(3).stroke();

            doc.fontSize(12).fillColor('#E2E8F0').text(`PERIODO: ${period.toUpperCase()}`, 0, 520, { align: 'center' });

            // Manager Info on Cover
            doc.moveDown(1);
            doc.fontSize(10).fillColor('#94A3B8').text(`GESTOR RESPONSABLE: ${managerInfo.name.toUpperCase()}`, { align: 'center' });
            doc.text(`CONTACTO: ${managerInfo.email}`, { align: 'center' });

            doc.fontSize(10).fillColor('#64748B').text(`Generado por UTP Control Intelligence • ${new Date().toLocaleDateString()}`, 0, 750, { align: 'center' });

            doc.addPage();

            // --- PÁGINA 1: RESUMEN EJECUTIVO (North Star) ---
            this.drawHeader(doc);

            // Header Info Box
            const headerY = 110;
            doc.roundedRect(50, headerY, 500, 45, 8).fill('#F8FAFC');
            doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(9).text('GESTOR:', 70, headerY + 10);
            doc.font('Helvetica').text(managerInfo.name, 70, headerY + 25);

            doc.font('Helvetica-Bold').text('EMAIL:', 300, headerY + 10);
            doc.font('Helvetica').text(managerInfo.email, 300, headerY + 25);

            doc.font('Helvetica-Bold').text('FAMILIA:', 450, headerY + 10);
            doc.font('Helvetica').text('OPERACIONES', 450, headerY + 25);

            doc.moveDown(6);
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#0F172A').text('1. Métricas North Star');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').fillColor('#64748B').text('Indicadores clave de alto nivel para la toma de decisiones estratégicas.');
            doc.moveDown(1.5);

            // KPI BOXES with better design
            const startY = doc.y;
            this.drawKpiBox(doc, 'ICOE (Cobertura)', stats.coverage || '0%', '#3B82F6', 50, startY);
            this.drawKpiBox(doc, 'Cumplimiento', stats.compliance || '0%', '#10B981', 220, startY);

            const riskLevel = stats.criticalAlerts > 5 ? 'CRÍTICO' : stats.criticalAlerts > 0 ? 'MEDIO' : 'BAJO';
            const riskColor = stats.criticalAlerts > 5 ? '#EF4444' : stats.criticalAlerts > 0 ? '#F59E0B' : '#10B981';
            this.drawKpiBox(doc, 'Riesgo Global', riskLevel, riskColor, 390, startY);

            // Rest of content
            doc.y = startY + 100;
            doc.moveDown(2);

            // --- PÁGINA 2: ANÁLISIS DE RIESGOS ---
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#0F172A').text('2. Salud Operativa y Alertas');
            doc.moveDown(1);

            // Detailed Alertas Table
            const tableTop = doc.y;
            doc.rect(50, tableTop, 500, 25).fill('#F8FAFC');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748B');
            doc.text('CATEGORÍA DE ALERTA', 60, tableTop + 8);
            doc.text('VOLUMEN', 250, tableTop + 8); // Ajustado
            doc.text('NOVEDAD ENCONTRADA', 350, tableTop + 8); // Nuevo
            doc.text('PRIORIDAD', 480, tableTop + 8);

            let rowY = tableTop + 25;
            const drawRow = (label: string, value: any, detail: string, priority: string, color: string) => {
                // Check for page break
                if (rowY > 700) {
                    doc.addPage();
                    this.drawHeader(doc);
                    rowY = 120; // Reset Y after header
                }

                doc.fontSize(10).font('Helvetica').fillColor('#1E293B').text(label, 60, rowY + 10);
                doc.text(value.toString(), 250, rowY + 10);

                // Use wrap for detail to avoid overlap
                const detailX = 350;
                const detailWidth = 120;
                doc.font('Helvetica').fillColor('#475569').text(detail, detailX, rowY + 10, {
                    width: detailWidth,
                    align: 'left'
                });

                doc.font('Helvetica-Bold').fillColor(color).text(priority, 480, rowY + 10);

                // Calculate next row Y based on content height
                const detailHeight = doc.heightOfString(detail, { width: detailWidth });
                rowY += Math.max(30, detailHeight + 15);

                doc.moveTo(50, rowY).lineTo(550, rowY).strokeColor('#F1F5F9').lineWidth(1).stroke();
            };

            // Render real alerts if available, otherwise fallback to summaries
            if (stats.recentAlerts && stats.recentAlerts.length > 0) {
                stats.recentAlerts.forEach((alert: any) => {
                    const color = alert.priority === 'HIGH' ? '#EF4444' : alert.priority === 'MEDIUM' ? '#F59E0B' : '#3B82F6';
                    const label = alert.priority === 'HIGH' ? 'CRÍTICA' : alert.priority === 'MEDIUM' ? 'PREVENTIVA' : 'INFORMATIVA';
                    drawRow(label, '1', alert.content || 'Sin detalle', alert.priority === 'HIGH' ? 'INMEDIATA' : 'SEGUIMIENTO', color);
                });
            } else {
                drawRow('Alertas Críticas', stats.criticalAlerts || 0, 'Sin novedades críticas registradas', 'INMEDIATA', '#EF4444');
                drawRow('Alertas Preventivas', stats.preventiveAlerts || 0, 'Monitoreo de rutina activo', 'SEGUIMIENTO', '#F59E0B');
                drawRow('Alertas Informativas', 12, 'Reporte de comunicación estándar', 'NORMAL', '#3B82F6');
            }

            doc.moveDown(4);
            // Ensure recommendations are on a safe Y
            if (rowY > 600) {
                doc.addPage();
                this.drawHeader(doc);
                rowY = 120;
            } else {
                rowY += 20;
            }

            // --- SECCIÓN: RECOMENDACIONES ESTRATÉGICAS ---
            doc.y = rowY;
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#0F172A').text('3. Recomendaciones de Inteligencia');
            doc.moveDown(1);

            const recY = doc.y;
            doc.roundedRect(50, recY, 500, 120, 15).fill('#F1F5F9');
            doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(11).text('Acciones Sugeridas:', 70, recY + 20);

            doc.font('Helvetica').fontSize(10).fillColor('#334155');
            const recommendations: string[] = [];
            const coverageVal = parseInt((stats.coverage || '0%').toString().replace('%', '')) || 0;

            if (coverageVal < 80) recommendations.push('• Incrementar esfuerzos de cobertura en municipios con ICOE < 70%.');
            if (stats.criticalAlerts > 0) recommendations.push('• Desplegar auditoría técnica en zonas con alertas críticas activas.');
            if (coverageVal >= 80) recommendations.push('• Mantener ritmo operativo; alta eficiencia detectada en cumplimiento.');
            if (recommendations.length === 0) recommendations.push('• Operación estable. Se sugiere optimizar rutas para reducir costos.');

            recommendations.forEach((rec, i) => {
                doc.text(rec, 75, recY + 45 + (i * 20));
            });

            this.drawFooter(doc);
            doc.end();
        });
    }

    private drawKpiBox(doc: PDFKit.PDFDocument, label: string, value: string, color: string, x: number, y: number) {
        doc.roundedRect(x, y, 160, 90, 15).fillOpacity(0.08).fill(color);
        doc.fillOpacity(1);

        // Icon / Dot
        doc.circle(x + 20, y + 22, 4).fill(color);

        doc.fontSize(9).font('Helvetica-Bold').fillColor(color).text(label.toUpperCase(), x + 30, y + 18);
        doc.fontSize(28).font('Helvetica-Bold').fillColor('#0F172A').text(value, x + 20, y + 45);
    }

    private drawField(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#94A3B8').text(label.toUpperCase(), x, y);
        doc.fontSize(12).font('Helvetica').fillColor('#1E293B').text(value || 'N/A', x, y + 15);
    }
}

