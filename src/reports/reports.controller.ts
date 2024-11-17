import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/Guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('favorites/movies/pdf')
  async getFavoritesMoviesPdf(@Res() res: Response, @Req() req) {
    const userId: string = req.user.id;
    return this.reportsService.generateFavoritesMoviesPdf(userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/movies/docx')
  async getFavoritesMoviesDocx(@Res() res: Response, @Req() req) {
    const userId: string = req.user.id;
    return this.reportsService.generateFavoritesMoviesDocx(userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/actors/pdf')
  async getFavoritesActorsPdf(@Res() res: Response, @Req() req) {
    const userId: string = req.user.id;
    return this.reportsService.generateFavoritesActorsPdf(userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/actors/docx')
  async getFavoritesActorsDocx(@Res() res: Response, @Req() req) {
    const userId: string = req.user.id;
    return this.reportsService.generateFavoritesActorsDocx(userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/directors/pdf')
  async getFavoritesDirectorsPdf(@Res() res: Response, @Req() req) {
    const userId: string = req.user.id;
    return this.reportsService.generateFavoritesDirectorsPdf(userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/directors/docx')
  async getFavoritesDirectorsDocx(@Res() res: Response, @Req() req) {
    const userId: string = req.user.id;
    return this.reportsService.generateFavoritesDirectorsDocx(userId, res);
  }
}
