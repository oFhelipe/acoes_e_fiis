import puppeteer from "puppeteer";
import lodash from "lodash";

enum Headers {
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
  console.log(headers);
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
    const passesInPVPFilter =
      fii[Headers["P/VP"]] >= 0.95 && fii[Headers["P/VP"]] <= 1.04;

    const passesInVacanciaMediaFilter =
      fii[Headers["Vacância Média"]] >= 0 && fii[Headers["P/VP"]] <= 6;

    const passesInLiquidezFilter = fii[Headers["Liquidez"]] >= 2000000;

    const passesInImoveisFilter = fii[Headers["Qtd de imóveis"]] >= 1;

    return (
      passesInPVPFilter &&
      passesInVacanciaMediaFilter &&
      passesInLiquidezFilter &&
      passesInImoveisFilter
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

  formattedResults = increasePrimoPoints(
    lodash.orderBy(formattedResults, [Headers["Vacância Média"]], ["asc"])
  );

  // formattedResults = increasePrimoPoints(
  //   lodash.orderBy(formattedResults, [Headers["Preço do m2"]], ["desc"])
  // );

  // formattedResults = increasePrimoPoints(
  //   lodash.orderBy(formattedResults, [Headers["Aluguel por m2"]], ["desc"])
  // );

  // formattedResults = increasePrimoPoints(
  //   lodash.orderBy(formattedResults, [Headers["Cap Rate"]], ["desc"])
  // );

  formattedResults = increasePrimoPoints(
    lodash.orderBy(formattedResults, [Headers["Liquidez"]], ["desc"])
  );

  // formattedResults = increasePrimoPoints(
  //   lodash.orderBy(formattedResults, [Headers["Valor de Mercado"]], ["desc"])
  // );

  const result = lodash.orderBy(formattedResults, ["primo"], ["asc"]);
  console.log(result);
})();
("");
