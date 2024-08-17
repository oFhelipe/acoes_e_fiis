import puppeteer, { Page } from "puppeteer";
import { expectedHeaders } from "../../domain/utils";
import { IFii, FiiHeaderNames } from "../../domain/entities/fii";
import lodash from "lodash";

export interface ListFiiUsecase {
  list(filter: FilterFiiDto): Promise<IFii[]>;
}

export class ListFiiUsecaseImplementation implements ListFiiUsecase {
  private async getFiisDataFromFundamentus(page: Page) {
    await page.goto("https://fundamentus.com.br/fii_resultado.php");

    const headers: FiiHeaderNames[] = await page.evaluate(() => {
      const cells = Array.from(
        document.querySelectorAll("#tabelaResultado > thead > tr > th")
      ) as HTMLElement[];

      return cells.map((cell) =>
        cell.innerText.trim()
      ) as any as FiiHeaderNames[];
    });

    const areAllHeadersCorrect = headers.every((header, index) => {
      const expectedHeader = expectedHeaders[index];
      if (header !== expectedHeader) {
        console.log({ header, expectedHeader });
      }
      return header === expectedHeader;
    });

    if (!areAllHeadersCorrect) {
      throw Error("Headers não são mais os mesmos de quando montei o código");
    }

    const fiisData = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll("#tabelaResultado > tbody > tr")
      );

      return rows.map((row) => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        return cells.map((cell, i) => {
          if (i === 0 || i === 1) {
            return cell.textContent as string | number;
          }

          return Number(
            cell.textContent
              ?.replace(/\%/g, "")
              .replace(/\./g, "")
              .replace(/\,/g, ".")
          );
        });
      });
    });

    return fiisData.map((fii) => {
      const formattedFii: IFii = {} as IFii;

      expectedHeaders.forEach((header, i) => {
        if (header === FiiHeaderNames.Endereço) {
          return;
        }
        formattedFii[header] = fii[i] as never;
      });
      formattedFii.pontuacao = 0;
      return formattedFii;
    });
  }

  private applyFilter(fiis: IFii[], filter: FilterFiiDto) {
    fiis = fiis.filter((fii) => {
      const passesInDividendYield =
        fii[FiiHeaderNames["Dividend Yield"]] >= filter.dividendYieldMin;

      const passesInLiquidezFilter =
        fii[FiiHeaderNames["Liquidez"]] >= filter.liquidezMin;

      const passesInVacanciaMediaFilter =
        fii[FiiHeaderNames["Vacância Média"]] <= filter.vacanciaMax;

      const passesInPVPFilter =
        fii[FiiHeaderNames["P/VP"]] >= filter.pVPMin &&
        fii[FiiHeaderNames["P/VP"]] <= filter.pVPMax;

      return (
        passesInDividendYield &&
        passesInPVPFilter &&
        passesInVacanciaMediaFilter &&
        passesInLiquidezFilter
      );
    });
  }

  private increasePontuacaoByKey(
    fiis: IFii[],
    key: FiiHeaderNames,
    order: "asc" | "desc"
  ) {
    const orderedFiis = lodash.orderBy(fiis, key, order);
    const increaseUntil = Math.min(Math.ceil(fiis.length / 2), 5);

    for (let i = 0; i < increaseUntil; i++) {
      orderedFiis[i] = {
        ...orderedFiis[i],
        pontuacao: orderedFiis[i].pontuacao ? orderedFiis[i].pontuacao + 1 : 1,
      };
    }

    fiis = orderedFiis;
  }

  private increasePontuacaoIfFFOYIsGraterThanDY(fiis: IFii[]) {
    for (let i = 0; i < fiis.length; i++) {
      fiis[i] = {
        ...fiis[i],
        pontuacao:
          fiis[i]["FFO Yield"] > fiis[i]["Dividend Yield"]
            ? fiis[i].pontuacao + 1
            : fiis[i].pontuacao,
      };
    }
  }

  public async list(filter: FilterFiiDto): Promise<IFii[]> {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    try {
      const fiis = await this.getFiisDataFromFundamentus(page);

      this.applyFilter(fiis, filter);

      this.increasePontuacaoByKey(fiis, FiiHeaderNames["Cap Rate"], "asc");

      this.increasePontuacaoIfFFOYIsGraterThanDY(fiis);

      await browser.close();

      return lodash.orderBy(fiis, ["pontuacao"], ["desc"]);
    } catch (error: any) {
      await browser.close();
      throw new Error(error);
    }
  }
}
