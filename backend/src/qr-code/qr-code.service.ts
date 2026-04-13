import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

export type QrCodeFormat = 'png' | 'svg' | 'eps';

export type GeneratedQrCodeAsset = {
  payload: Buffer | string;
  contentType: string;
  extension: QrCodeFormat;
};

@Injectable()
export class QrCodeService {
  async generate(
    rawUrl: string,
    format: QrCodeFormat,
    size: number,
  ): Promise<GeneratedQrCodeAsset> {
    const url = this.normalizeUrl(rawUrl);

    if (format === 'png') {
      const payload = await QRCode.toBuffer(url, {
        type: 'png',
        width: size,
        errorCorrectionLevel: 'M',
      });
      return {
        payload,
        contentType: 'image/png',
        extension: 'png',
      };
    }

    if (format === 'svg') {
      const payload = this.renderSvg(url, size);
      return {
        payload,
        contentType: 'image/svg+xml; charset=utf-8',
        extension: 'svg',
      };
    }

    return {
      payload: this.renderEps(url, size),
      contentType: 'application/postscript; charset=utf-8',
      extension: 'eps',
    };
  }

  private normalizeUrl(value: string): string {
    const normalized = new URL(value.trim());
    return normalized.toString();
  }

  private renderEps(value: string, preferredSize: number): string {
    const qr = QRCode.create(value, {
      errorCorrectionLevel: 'M',
    });
    const { moduleSize, quietZone, totalModules, canvasSize } =
      this.resolveCanvasSize(qr.modules.size, preferredSize);

    const modulesPerSide = qr.modules.size;

    const lines: string[] = [
      '%!PS-Adobe-3.0 EPSF-3.0',
      `%%BoundingBox: 0 0 ${canvasSize} ${canvasSize}`,
      '%%LanguageLevel: 2',
      '%%Pages: 1',
      '%%EndComments',
      '1 setgray',
      `0 0 ${canvasSize} ${canvasSize} rectfill`,
      '0 setgray',
    ];

    for (let row = 0; row < modulesPerSide; row += 1) {
      for (let col = 0; col < modulesPerSide; col += 1) {
        if (qr.modules.get(row, col) !== 1) {
          continue;
        }

        const x = (col + quietZone) * moduleSize;
        const y = (totalModules - quietZone - row - 1) * moduleSize;
        lines.push(`${x} ${y} ${moduleSize} ${moduleSize} rectfill`);
      }
    }

    lines.push('showpage', '%%EOF');
    return lines.join('\n');
  }

  private renderSvg(value: string, preferredSize: number): string {
    const qr = QRCode.create(value, {
      errorCorrectionLevel: 'M',
    });
    const { moduleSize, quietZone, canvasSize } = this.resolveCanvasSize(
      qr.modules.size,
      preferredSize,
    );

    const modulesPerSide = qr.modules.size;
    const rects: string[] = [];

    for (let row = 0; row < modulesPerSide; row += 1) {
      for (let col = 0; col < modulesPerSide; col += 1) {
        if (qr.modules.get(row, col) !== 1) {
          continue;
        }

        const x = (col + quietZone) * moduleSize;
        const y = (row + quietZone) * moduleSize;
        rects.push(
          `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" />`,
        );
      }
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}" width="${canvasSize}" height="${canvasSize}" shape-rendering="crispEdges">`,
      `<rect width="${canvasSize}" height="${canvasSize}" fill="#ffffff" />`,
      `<g fill="#000000">`,
      ...rects,
      '</g>',
      '</svg>',
    ].join('\n');
  }

  private resolveCanvasSize(
    modulesPerSide: number,
    preferredSize: number,
  ): {
    moduleSize: number;
    quietZone: number;
    totalModules: number;
    canvasSize: number;
  } {
    const quietZone = 4;
    const totalModules = modulesPerSide + quietZone * 2;
    const moduleSize = Math.max(1, Math.floor(preferredSize / totalModules));
    const canvasSize = moduleSize * totalModules;
    return {
      moduleSize,
      quietZone,
      totalModules,
      canvasSize,
    };
  }
}
