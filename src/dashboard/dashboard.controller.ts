import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('sales-chart')
  getSalesChart(@Query('period') period: '7d' | '30d' = '7d') {
    return this.dashboardService.getSalesChart(period);
  }

  @Get('export-pdf')
  async exportPdf(@Res() res: Response) {
    // Export PDF delegue au frontend (ex: jsPDF) si le delai est serre.
    // Sinon : generer ici avec la librairie 'pdfmake' a partir de getStats().
    res.status(501).json({
      message: "Export PDF non implemente cote backend - voir le frontend (jsPDF).",
    });
  }
}
