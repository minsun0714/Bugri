// Unit tests exercise accessible editing controls; real Canvas is verified in Playwright.
jest.mock("@/components/shop/zdog/engine", () => ({
  createDeskEngine: () => ({
    sync: jest.fn(),
    dispose: jest.fn(),
    view: jest.fn(),
    cancel: jest.fn(),
  }),
}));
