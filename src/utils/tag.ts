import chalk from "chalk";
import ip from "ip";
import os from "os";
import { LoadedRoute, RouteGroup } from "../types/route";
import { table } from "console";

const tag = chalk.blue`

██████  ███████ ███████ ██  ██████  ███    ██ ██████  ██    ██ ████████ ███████ 
██   ██ ██      ██      ██ ██       ████   ██ ██   ██  ██  ██     ██    ██      
██   ██ █████   ███████ ██ ██   ███ ██ ██  ██ ██████    ████      ██    █████   
██   ██ ██           ██ ██ ██    ██ ██  ██ ██ ██   ██    ██       ██    ██      
██████  ███████ ███████ ██  ██████  ██   ████ ██████     ██       ██    ███████ 
                                                                                     
`;

const authors = ["Tomasz Magiera"];

function showTag() {
    console.log(tag);
}

function welcomeMessage() {
    const lines: string[] = [
        chalk.gray("=".repeat(80)),
        `${chalk.green("✓ ")} ${chalk.bold("App Name:")} ${chalk.yellowBright(
            `designByte.pl API`
        )}`,
        `${chalk.green("✓ ")} ${chalk.bold("Description:")} ${chalk.gray(
            `https://designByte.pl API`
        )}`,
        `${chalk.green("✓ ")} ${chalk.bold("Authors:")}`,
    ];

    for (const author of authors) {
        lines.push(`${chalk.blueBright("-")} ${chalk.gray(author)}`);
    }
    lines.push(chalk.gray("=".repeat(80)));
    lines.push("");

    console.log(tag);
    for (const line of lines) {
        console.log(line);
    }
}

function runningMessage(startTime: number) {
    const endTime = performance.now();
    const bootTime = (endTime - startTime).toFixed(2);
    const lines: string[] = [
        chalk.gray("=".repeat(80)),

        chalk.green("✓ ") + chalk.bold("Status:") + chalk.greenBright("Online"),
        chalk.green("✓ ") +
            chalk.bold("Czas uruchomienia:") +
            chalk.yellowBright(bootTime + "ms"),
        chalk.green("✓ ") +
            chalk.bold("Port:") +
            chalk.yellowBright(process.env.PORT || "8000"),
        chalk.green("✓ ") +
            chalk.bold("Środowisko:") +
            chalk.yellowBright(process.env.NODE_ENV || "development"),
        chalk.green("✓ ") +
            chalk.bold("URL lokalny:") +
            chalk.blueBright(`http://localhost:${process.env.PORT || "8000"}`),
        chalk.green("✓ ") +
            chalk.bold("URL sieciowy:") +
            chalk.blueBright(
                `http://${ip.address() || "localhost"}:${
                    process.env.PORT || "8000"
                }`
            ),

        chalk.gray("=".repeat(80)),

        chalk.cyan("ℹ ") + chalk.bold("Hostname:") + chalk.gray(os.hostname()),
        chalk.cyan("ℹ ") +
            chalk.bold("System:") +
            chalk.gray(` ${os.platform()} ${os.release()}`),
        chalk.cyan("ℹ ") + chalk.bold("Node:") + chalk.gray(process.version),

        chalk.gray("=".repeat(80)),

        chalk.magenta("ℹ ") +
            chalk.magenta("Naciśnij Ctrl + C aby zatrzymać serwer"),

        chalk.gray("=".repeat(80)),
    ];

    console.clear();
    console.log(tag);
    for (const line of lines) {
        console.log(line);
    }
}

function databaseMessage(status: boolean) {
    const lines: string[] = [
        chalk.red("✗") +
            chalk.bold(" MongoDB:") +
            (status ? chalk.green("Online") : chalk.red("Offline")),
        chalk.gray("=".repeat(80)),
    ];

    for (const line of lines) {
        console.log(line);
    }
}

/**
 * Prosta funkcja tworząca elegancką tabelę w konsoli
 * @param rows Wiersze tabeli (pierwszy wiersz to nagłówki)
 * @param sectionRows Indeksy wierszy, które mają być nagłówkami sekcji (ignorując nagłówek tabeli)
 * @returns Sformatowany string z tabelą
 */
function createTable(rows: string[][], sectionRows: number[] = []): string {
    // Sprawdzamy czy mamy jakieś wiersze
    if (rows.length === 0) {
        return "Brak danych do wyświetlenia";
    }

    // Znajdujemy maksymalną szerokość dla każdej kolumny
    const colWidths: number[] = [];
    rows.forEach((row) => {
        row.forEach((cell, i) => {
            // Usuwamy kody ANSI do obliczania długości
            const cellLength = stripAnsi(cell).length;
            colWidths[i] = Math.max(colWidths[i] || 0, cellLength);
        });
    });

    // Obliczamy całkowitą szerokość tabeli (suma szerokości kolumn + znaki |)
    const totalWidth = colWidths.reduce((sum, width) => sum + width + 3, 1);

    // Tworzymy separator wierszy
    const separator = `+${colWidths.map((w) => "-".repeat(w + 2)).join("+")}+`;

    // Tworzymy nagłówek tabeli
    let table = separator + "\n";

    // Dodajemy wiersze
    rows.forEach((row, rowIndex) => {
        // Sprawdź czy to jest nagłówek sekcji
        if (sectionRows.includes(rowIndex)) {
            // Zawsze dodaj separator przed nagłówkiem sekcji, chyba że to pierwszy wiersz po nagłówku tabeli
            if (rowIndex > 1) {
                table += separator + "\n";
            }

            // Jeśli tak, utwórz wiersz rozpinający całą szerokość tabeli
            const sectionName = row[0]; // Używamy pierwszej kolumny jako nazwy sekcji
            const sectionNameLength = stripAnsi(sectionName).length;
            const padding = Math.floor(
                (totalWidth - sectionNameLength - 2) / 2
            );

            table += `|${" ".repeat(padding)}${sectionName}${" ".repeat(
                totalWidth - padding - sectionNameLength - 2
            )}|\n`;

            // Zawsze dodaj separator po nagłówku sekcji
            table += separator + "\n";
        } else {
            // Standardowy wiersz z danymi
            const formattedRow = row.map((cell, i) => {
                const cellLength = stripAnsi(cell).length;
                return " " + cell + " ".repeat(colWidths[i] - cellLength + 1);
            });

            table += `|${formattedRow.join("|")}|\n`;

            // Po nagłówku tabeli dodajemy separator
            if (rowIndex === 0) {
                table += separator + "\n";
            }
        }
    });

    // Dodajemy dolny separator
    table += separator;

    return table;
}

/**
 * Usuwa kody ANSI z tekstu aby poprawnie obliczyć długość
 */
function stripAnsi(str: string): string {
    return str.replace(/\u001b\[[0-9]+m/g, "");
}

function showRoutesTable(routes: LoadedRoute[]) {
    // Sprawdź czy są jakieś trasy do wyświetlenia
    if (!routes || routes.length === 0) {
        console.log(chalk.yellow("Brak zarejestrowanych tras"));
        return;
    }

    console.log(chalk.gray("=".repeat(80)));
    console.log();

    // Tworzenie danych tabeli
    const tableData = [
        // Nagłówki
        [
            // chalk.bold("Base URL"),
            chalk.bold("Route"),
            chalk.bold("Method"),
            chalk.bold("State"),
        ],
    ];

    // Indeksy wierszy, które są nagłówkami sekcji
    const sectionRows: number[] = [];
    let routesCount: number = 0;

    // Pogrupuj trasy według base URL i posortuj klucze
    const groupedRoutes = routes.reduce((acc, route) => {
        const baseUrl = route.baseUrl || "/";
        if (!acc[baseUrl]) {
            acc[baseUrl] = [];
        }

        route.routes.forEach((r) => {
            acc[baseUrl].push({
                url: r.url,
                method: r.method,
                error: r.error,
            });
        });

        return acc;
    }, {} as Record<string, Array<{ url: string; method: string; error?: boolean }>>);

    // Uzyskaj posortowane klucze, aby mieć je w spójnej kolejności
    const sortedBaseUrls = Object.keys(groupedRoutes).sort((a, b) => {
        // Umieść root (/) na końcu
        if (a === "/") return 1;
        if (b === "/") return -1;
        return a.localeCompare(b);
    });

    // Dodaj dane do tabeli, umieszczając nagłówki sekcji
    sortedBaseUrls.forEach((baseUrl) => {
        // Dodaj wiersz nagłówka sekcji
        const normalizedBaseUrl = baseUrl.endsWith("/")
            ? baseUrl.slice(0, -1)
            : baseUrl;

        // Dodaj indeks do sectionRows aby oznaczyć, że ten wiersz to nagłówek sekcji
        sectionRows.push(tableData.length);

        // Dodaj wiersz z nagłówkiem sekcji
        tableData.push([
            chalk.bold.cyan(`${normalizedBaseUrl || "/"}`),
            "",
            "",
            // "",
        ]);

        // Dodaj trasy dla tej sekcji
        groupedRoutes[baseUrl].forEach((route) => {
            routesCount += 1;
            const routePath = route.url.startsWith("/")
                ? route.url
                : "/" + route.url;

            tableData.push([
                // chalk.cyan(normalizedBaseUrl || "/"),
                chalk.blueBright(routePath),
                getMethodColor(route.method)(route.method.toUpperCase()),
                route.error ? chalk.red("Błąd") : chalk.green("OK"),
            ]);
        });
    });

    // Wyświetl tabelę z nagłówkami sekcji
    console.log(createTable(tableData, sectionRows));
    console.log();
    console.log(`Łączna liczba tras: ${chalk.yellowBright(routesCount)}`);
    console.log(chalk.gray("=".repeat(80)));
}

function getMethodColor(method: string) {
    switch (method.toUpperCase()) {
        case "GET":
            return chalk.green;
        case "POST":
            return chalk.blue;
        case "PUT":
            return chalk.yellow;
        case "DELETE":
            return chalk.red;
        case "PATCH":
            return chalk.cyan;
        default:
            return chalk.white;
    }
}

export {
    showTag,
    welcomeMessage,
    runningMessage,
    databaseMessage,
    showRoutesTable,
};
export default {
    showTag,
    welcomeMessage,
    runningMessage,
    databaseMessage,
    showRoutesTable,
};
