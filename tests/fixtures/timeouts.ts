export const timeouts = {
  test:       90_000,   // max duration of a single test
  action:     30_000,   // single interaction: click, fill, select
  navigation: 60_000,   // page.goto() / waitForNavigation
  expect:     15_000,   // expect().toHaveURL() / toBeVisible() etc.
} as const;
