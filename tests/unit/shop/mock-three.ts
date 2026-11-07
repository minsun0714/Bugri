// Unit tests exercise accessible editing controls; real WebGL is verified in Playwright.
jest.mock("@/components/shop/three/engine", () => ({
  createDeskEngine: () => ({
    sync: jest.fn(),
    dispose: jest.fn(),
    view: jest.fn(),
    cancel: jest.fn(),
  }),
}));
