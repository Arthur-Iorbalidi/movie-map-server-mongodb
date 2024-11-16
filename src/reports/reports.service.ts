import { BadRequestException, Injectable } from '@nestjs/common';
import { Paragraph, Packer, Document, AlignmentType, TextRun } from 'docx';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { PDFDocument, rgb } from 'pdf-lib';
import { Movie } from 'src/movie/movie.model';

@Injectable()
export class ReportsService {
  constructor(private userService: UserService) {}

  async generateFavoritesMoviesPdf(userId: string, res: Response) {
    const movies = (await this.userService.getFavoritesMovies(
      userId,
    )) as unknown as Movie[];

    if (!movies || movies.length === 0) {
      throw new BadRequestException('No favorite movies found');
    }

    const pdfDoc = await PDFDocument.create();
    const pageMargin = 50;
    const lineHeight = 20;
    const titleFontSize = 20;
    const contentFontSize = 14;
    const contentIndent = 50;

    let page = pdfDoc.addPage();
    const { height } = page.getSize();
    let yPosition = height - pageMargin;

    page.drawText('Favorite Movies Report', {
      x: contentIndent,
      y: yPosition,
      size: titleFontSize,
      color: rgb(0, 0, 0),
    });

    yPosition -= 2 * lineHeight;

    movies.forEach((movie) => {
      if (yPosition < pageMargin + lineHeight * 4) {
        page = pdfDoc.addPage();
        yPosition = height - pageMargin;
        yPosition -= 2 * lineHeight;
      }

      page.drawText(`Title: ${movie.title}`, {
        x: contentIndent,
        y: yPosition,
        size: contentFontSize,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;

      page.drawText(`Genre: ${movie.genre}`, {
        x: contentIndent,
        y: yPosition,
        size: contentFontSize - 2,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;

      page.drawText(`Release Date: ${movie.creationDate}`, {
        x: contentIndent,
        y: yPosition,
        size: contentFontSize - 2,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;

      page.drawText(`Budget: ${movie.budget}`, {
        x: contentIndent,
        y: yPosition,
        size: contentFontSize - 2,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight * 2;
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=favorites.pdf');
    res.send(Buffer.from(pdfBytes));
  }

  async generateFavoritesMoviesDocx(userId: string, res: Response) {
    const movies = (await this.userService.getFavoritesMovies(
      userId,
    )) as unknown as Movie[];

    if (!movies || movies.length === 0) {
      throw new BadRequestException('No favorite movies found');
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Favorite Movies Report',
                  bold: true,
                  size: 28,
                  color: '000000',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...movies.flatMap((movie) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Title: ${movie.title}`,
                    bold: true,
                    size: 24,
                    color: '2E75B6',
                  }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Genre: ${movie.genre}`,
                    bold: true,
                    size: 20,
                    color: '1F4E78',
                  }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Release Date: ${movie.creationDate}`,
                    size: 20,
                    color: '5B9BD5',
                  }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Budget: ${movie.budget}`,
                    size: 20,
                    color: '5B9BD5',
                  }),
                ],
                spacing: { after: 300 },
              }),
            ]),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=favorites.docx');

    res.send(buffer);
  }
}
