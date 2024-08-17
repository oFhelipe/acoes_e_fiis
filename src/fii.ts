import puppeteer from "puppeteer";
import lodash from "lodash";
import fs from "fs";

enum HeaderIndex {
  "Papel",
  "Segmento",
  "Cotação",
  "FFO Yield",
  "Dividend Yield",
  "P/VP",
  "Valor de Mercado",
  "Liquidez",
  "Qtd de imóveis",
  "Preço do m2",
  "Aluguel por m2",
  "Cap Rate",
  "Vacância Média",
  "Endereço",
}

enum HeaderNames {
  "Papel" = "Papel",
  "Segmento" = "Segmento",
  "Cotação" = "Cotação",
  "FFO Yield" = "FFO Yield",
  "Dividend Yield" = "Dividend Yield",
  "P/VP" = "P/VP",
  "Valor de Mercado" = "Valor de Mercado",
  "Liquidez" = "Liquidez",
  "Qtd de imóveis" = "Qtd de imóveis",
  "Preço do m2" = "Preço do m2",
  "Aluguel por m2" = "Aluguel por m2",
  "Cap Rate" = "Cap Rate",
  "Vacância Média" = "Vacância Média",
  "Endereço" = "Endereço",
}

type FormattedFii = {
  Papel: number;
  Segmento: number;
  Cotação: number;
  "FFO Yield": number;
  "Dividend Yield": number;
  "P/VP": number;
  "Valor de Mercado": number;
  Liquidez: number;
  "Qtd de imóveis": number;
  "Preço do m2": number;
  "Aluguel por m2": number;
  "Cap Rate": number;
  "Vacância Média": number;
  Endereço: number;
  primo: number;
};

function increasePrimoPoints(fiis: FormattedFii[]) {
  const increaseUntil = Math.min(Math.ceil(fiis.length / 2), 5);

  for (let i = 0; i < increaseUntil; i++) {
    fiis[i] = {
      ...fiis[i],
      primo: fiis[i].primo ? fiis[i].primo + 1 : 1,
    };
  }

  return fiis;
}

function increaseIfFFOIsGraterThanDY(fiis: FormattedFii[]) {
  for (let i = 0; i < fiis.length; i++) {
    fiis[i] = {
      ...fiis[i],
      primo:
        fiis[i]["FFO Yield"] > fiis[i]["Dividend Yield"]
          ? fiis[i].primo + 1
          : fiis[i].primo,
    };
  }

  return fiis;
}

(async () => {
  const expectedHeaders = [
    "Papel",
    "Segmento",
    "Cotação",
    "FFO Yield",
    "Dividend Yield",
    "P/VP",
    "Valor de Mercado",
    "Liquidez",
    "Qtd de imóveis",
    "Preço do m2",
    "Aluguel por m2",
    "Cap Rate",
    "Vacância Média",
    "Endereço",
  ] as any as Headers[];

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
  });
  const page = await browser.newPage();

  await page.goto("https://fundamentus.com.br/fii_resultado.php");

  await page.setViewport({ width: 1280, height: 600 });

  await page.waitForSelector("#tabelaResultado > thead > tr");

  const headers: Headers[] = await page.evaluate(() => {
    const cells = Array.from(
      document.querySelectorAll("#tabelaResultado > thead > tr > th")
    ) as HTMLElement[];

    return cells.map((cell) => cell.innerText.trim()) as any as Headers[];
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

  const fiis = await page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll("#tabelaResultado > tbody > tr")
    );

    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      return cells.map((cell, i) => {
        if (i === 0 || i === 1) {
          return cell.textContent as any as number;
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

  const filteredSocks = fiis.filter((fii) => {
    const passesInDividendYield = fii[HeaderIndex["Dividend Yield"]] >= 7;

    const passesInLiquidezFilter = fii[HeaderIndex["Liquidez"]] >= 500000;

    const passesInVacanciaMediaFilter =
      fii[HeaderIndex["Vacância Média"]] <= 30;

    const passesInPVPFilter =
      fii[HeaderIndex["P/VP"]] >= 0.7 && fii[HeaderIndex["P/VP"]] <= 1.05;

    // const passesInFFOYieldFilter =
    //   fii[Headers["FFO Yield"]] > fii[Headers["Dividend Yield"]];

    return (
      passesInDividendYield &&
      passesInPVPFilter &&
      passesInVacanciaMediaFilter &&
      passesInLiquidezFilter
    );
  });

  let formattedResults = filteredSocks.map((fii) => {
    const formattedFii: FormattedFii = {} as FormattedFii;
    expectedHeaders.forEach((header, i) => {
      formattedFii[header as any as keyof FormattedFii] = fii[i];
    });
    formattedFii.primo = 0;
    return formattedFii;
  });
  console.log(formattedResults);
  const content = JSON.stringify(formattedResults, null, 2);
  const caminhoArquivo = 'resultado.txt';

  fs.writeFile(caminhoArquivo, content, (erro) => {
    if (erro) {
      console.error('Erro ao escrever o arquivo:', erro);
    } else {
      console.log('Arquivo escrito com sucesso!');
    }
  });


  formattedResults = increasePrimoPoints(
    lodash.orderBy(formattedResults, [HeaderNames["Cap Rate"]], ["desc"])
  );


  formattedResults = increaseIfFFOIsGraterThanDY(formattedResults);

  const result = lodash.orderBy(formattedResults, ["primo"], ["asc"]);
  console.log(result);
  await browser.close();
})();
("");
