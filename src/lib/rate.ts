export async function getEurRate(): Promise<number | null> {
  try {
    const response = await fetch(
      "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&json",
      { next: { revalidate: 60 * 60 * 12 } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { rate?: number }[];
    const rate = data[0]?.rate;
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}
