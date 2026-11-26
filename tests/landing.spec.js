import AxeBuilder from "@axe-core/playwright";
import { devices, expect, test } from "@playwright/test";

test("production page loads local assets without errors or CSP violations", async ({
  page,
  baseURL,
}) => {
  const failures = [];
  const external = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });
  page.on("requestfailed", (request) => failures.push(request.url()));
  page.on("response", (response) => {
    if (!response.ok()) failures.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(`${baseURL}/`)) external.push(request.url());
  });
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.cspViolations.push(event.violatedDirective);
    });
  });

  const response = await page.goto("/");
  expect(response.headers()["content-security-policy"]).toContain(
    "script-src 'self'; style-src 'self'",
  );
  const hero = page.getByRole("heading", { level: 1 });
  await expect(hero).toBeVisible();
  await page.mouse.move(200, 200);
  await expect(page.locator("#mouseGlow")).toHaveCSS("opacity", "1");
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter((font) => font.status === "loaded")
      .map((font) => font.family);
  });
  expect(fonts).toEqual(
    expect.arrayContaining(["Manrope", "Instrument Serif", "Phosphor-Fill"]),
  );
  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
  expect(failures).toEqual([]);
  expect(external).toEqual([]);
});

test("navigation fragments resolve and the order CTA does not imply an active checkout", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Navegação rápida" });
  for (const [name, id] of [
    ["Soluções", "produtos"],
    ["O App", "app"],
    ["FAQ", "faq"],
    ["Pedir agora", "pedir"],
    ["Início", "top"],
  ]) {
    await nav.getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }

  const missing = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.hash.slice(1))
        .filter((id) => !document.getElementById(id)),
    );
  expect(missing).toEqual([]);
  await expect(
    page.getByRole("link", { name: "Garantir minha máquina" }),
  ).toBeDisabled();
});

test("FAQ opens one answer at a time, and toggles with Enter and Space", async ({
  page,
}) => {
  await page.goto("/#faq");
  const [first, second, third] = await page.locator(".faq-btn").all();
  const firstPanel = page.locator("#faq-content-1");
  const secondPanel = page.locator("#faq-content-2");

  for (const button of [first, second, third])
    await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(firstPanel).toBeHidden();
  await expect(secondPanel).toBeHidden();
  await first.focus();
  await first.press("Enter");
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await expect(firstPanel).toBeVisible();

  await second.click();
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(firstPanel).toBeHidden();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(secondPanel).toBeVisible();
  await second.press("Space");
  await expect(second).toHaveAttribute("aria-expanded", "false");
  await expect(secondPanel).toBeHidden();
});

test.describe("mobile", () => {
  const { viewport, deviceScaleFactor, hasTouch, isMobile, userAgent } =
    devices["iPhone 13"];
  test.use({ viewport, deviceScaleFactor, hasTouch, isMobile, userAgent });

  test("mobile canvas does not overflow and the menu reaches sections", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
    const trigger = page.getByRole("button", { name: "Menu" });
    const menu = page.getByRole("navigation", { name: "Menu principal" });
    await expect(menu).toBeHidden();
    await trigger.tap();
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "FAQ" }).tap();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.locator("#faq")).toBeInViewport();
  });
});

test("reduced motion keeps content visible without glow, tilt or smooth scroll", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const card = page.locator(".tilt-card").first();
  await card.hover();
  await expect(card).toHaveCSS("transform", "none");
  await expect(card).toHaveCSS("opacity", "1");
  await expect(page.locator("#mouseGlow")).toBeHidden();
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await expect(page.locator(".animate-marquee")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    page.getByRole("checkbox", { name: "Pausar animação" }),
  ).toBeHidden();
});

test("the marquee can be paused and resumed by keyboard", async ({ page }) => {
  await page.goto("/");
  const pause = page.getByRole("checkbox", { name: "Pausar animação" });
  const marquee = page.locator(".animate-marquee");
  await expect(marquee).toHaveCSS("animation-play-state", "running");
  await pause.focus();
  await pause.press("Space");
  await expect(pause).toBeChecked();
  await expect(marquee).toHaveCSS("animation-play-state", "paused");
  await pause.press("Space");
  await expect(marquee).toHaveCSS("animation-play-state", "running");
});

test("axe finds no serious or critical accessibility violations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    ),
  ).toEqual([]);
});
