declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion?: string;
      IsAcroFormPresent?: boolean;
      IsXFAPPresent?: boolean;
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
    };
    metadata: {
      metadata?: string;
      [key: string]: any;
    };
    version: string;
  }

  function pdfParse(data: Buffer | string, options?: any): Promise<PDFParseResult>;
  export default pdfParse;
}
