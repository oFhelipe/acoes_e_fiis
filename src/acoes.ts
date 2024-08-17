import puppeteer from "puppeteer";
import lodash from "lodash";

enum Headers {
  "Papel",
  "Cotação",
  "P/L",
  "P/VP",
  "PSR",
  "Div.Yield",
  "P/Ativo",
  "P/Cap.Giro",
  "P/EBIT",
  "P/Ativ Circ.Liq",
  "EV/EBIT",
  "EV/EBITDA",
  "Mrg Ebit",
  "Mrg. Líq.",
  "Liq. Corr.",
  "ROIC",
  "ROE",
  "Liq.2meses",
  "Patrim. Líq",
  "Dív.Brut/ Patrim.",
  "Cresc. Rec.5a",
}

type FormattedStock = {
  Papel: number;
  Cotação: number;
  "P/L": number;
  "P/VP": number;
  PSR: number;
  "Div.Yield": number;
  "P/Ativo": number;
  "P/Cap.Giro": number;
  "P/EBIT": number;
  "P/Ativ Circ.Liq": number;
  "EV/EBIT": number;
  "EV/EBITDA": number;
  "Mrg Ebit": number;
  "Mrg. Líq.": number;
  "Liq. Corr.": number;
  ROIC: number;
  ROE: number;
  "Liq.2meses": number;
  "Patrim. Líq": number;
  "Dív.Brut/ Patrim.": number;
  "Cresc. Rec.5a": number;
  primo: number;
};

function increasePrimoPoints(stocks: FormattedStock[]) {
  const increaseUntil = Math.min(Math.ceil(stocks.length / 2), 5);

  for (let i = 0; i < increaseUntil; i++) {
    stocks[i] = {
      ...stocks[i],
      primo: stocks[i].primo ? stocks[i].primo + 1 : 1,
    };
  }

  return stocks;
}

(async () => {
  const expectedHeaders = [
    "Papel",
    "Cotação",
    "P/L",
    "P/VP",
    "PSR",
    "Div.Yield",
    "P/Ativo",
    "P/Cap.Giro",
    "P/EBIT",
    "P/Ativ Circ.Liq",
    "EV/EBIT",
    "EV/EBITDA",
    "Mrg Ebit",
    "Mrg. Líq.",
    "Liq. Corr.",
    "ROIC",
    "ROE",
    "Liq.2meses",
    "Patrim. Líq",
    "Dív.Brut/ Patrim.",
    "Cresc. Rec.5a",
  ] as any as Headers[];

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
  });
  const page = await browser.newPage();

  await page.goto("https://fundamentus.com.br/resultado.php");

  await page.setViewport({ width: 1280, height: 720 });

  await page.waitForSelector("#resultado > thead > tr");

  const headers: Headers[] = await page.evaluate(() => {
    const cells = Array.from(
      document.querySelectorAll("#resultado > thead > tr > th")
    ) as HTMLElement[];

    return cells.map((cell) => cell.innerText.trim()) as any as Headers[];
  });

  const areAllHeadersCorrect = headers.every((header, index) => {
    const expectedHeader = expectedHeaders[index];
    return header === expectedHeader;
  });

  if (!areAllHeadersCorrect) {
    throw Error("Headers não são mais os mesmos de quando montei o código");
  }

  const stocks = await page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll("#resultado > tbody > tr")
    );

    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      return cells.map((cell, i) => {
        if (i === 0) {
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

  const filteredSocks = stocks.filter((stock) => {
    const passesInPLFilter =
      stock[Headers["P/L"]] > 3 && stock[Headers["P/L"]] < 10;

    const passesInPVPFilter =
      stock[Headers["P/VP"]] >= 0.5 && stock[Headers["P/VP"]] <= 2;

    const passesInDivYieldFilter =
      stock[Headers["Div.Yield"]] > 8 && stock[Headers["Div.Yield"]] < 14;

    const passesInROEFilter =
      stock[Headers["ROE"]] > 15 && stock[Headers["ROE"]] < 30;

    const passesInLiq2meseFilter = stock[Headers["Liq.2meses"]] > 1000000;

    const passesInDivBrutPatrimFilter =
      stock[Headers["Dív.Brut/ Patrim."]] < 1.5;

    const passesInCrescRec5Filter = stock[Headers["Cresc. Rec.5a"]] > 10;

    return (
      passesInPLFilter &&
      passesInPVPFilter &&
      passesInROEFilter &&
      passesInCrescRec5Filter &&
      passesInDivYieldFilter &&
      passesInLiq2meseFilter &&
      passesInDivBrutPatrimFilter
    );
  });

  let formattedResults = filteredSocks.map((stock) => {
    const formattedStock: FormattedStock = {} as FormattedStock;
    expectedHeaders.forEach((header, i) => {
      formattedStock[header as any as keyof FormattedStock] = stock[i];
    });
    formattedStock.primo = 0;
    return formattedStock;
  });

  formattedResults = increasePrimoPoints(
    lodash.orderBy(formattedResults, ["P/L"], ["asc"])
  );

  formattedResults = increasePrimoPoints(
    lodash.orderBy(formattedResults, ["P/VP"], ["asc"])
  );

  formattedResults = increasePrimoPoints(
    lodash.orderBy(formattedResults, ["Div.Yield"], ["desc"])
  );

  formattedResults = increasePrimoPoints(
    lodash.orderBy(formattedResults, ["Dív.Brut/ Patrim."], ["asc"])
  );

  const result = lodash.orderBy(formattedResults, ["primo"], ["desc"]);
  console.log(result);
})();
("");
