import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { ThemePicker } from "@/components/ui/theme-picker";
import { themeBootstrapScript } from "@/lib/theme/bootstrap";

let dark = false;
let listeners: Set<() => void>;

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.themePreference;
  dark = false;
  listeners = new Set();
  window.matchMedia = jest.fn().mockImplementation(() => ({
    get matches() {
      return dark;
    },
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (
      _: string,
      listener: () => void,
    ) => listeners.delete(listener),
  }));
});

afterEach(() => jest.restoreAllMocks());

function bootstrap() {
  window.eval(themeBootstrapScript);
}

function choose(label: string) {
  fireEvent.click(
    screen.getByRole("combobox", { name: "화면 테마" }),
  );
  fireEvent.click(
    screen.getByRole("option", { name: label }),
  );
}

test("first paint follows system and restores an explicit preference", () => {
  dark = true;
  bootstrap();
  expect(document.documentElement.dataset.theme).toBe(
    "dark",
  );
  localStorage.setItem("bugri.theme", "light");
  bootstrap();
  expect(document.documentElement.dataset.theme).toBe(
    "light",
  );
  expect(document.documentElement.style.colorScheme).toBe(
    "only light",
  );
});

test("unknown and inaccessible storage safely follow the system", () => {
  dark = true;
  localStorage.setItem("bugri.theme", "invalid");
  bootstrap();
  expect(
    document.documentElement.dataset.themePreference,
  ).toBe("system");
  jest
    .spyOn(Storage.prototype, "getItem")
    .mockImplementation(() => {
      throw new Error("blocked");
    });
  bootstrap();
  expect(document.documentElement.dataset.theme).toBe(
    "dark",
  );
});

test("manual choice persists, overrides system changes, and system mode resumes following", () => {
  bootstrap();
  render(<ThemePicker />);
  choose("다크");
  expect(localStorage.getItem("bugri.theme")).toBe("dark");
  act(() => listeners.forEach((listener) => listener()));
  expect(document.documentElement.dataset.theme).toBe(
    "dark",
  );
  choose("시스템");
  expect(document.documentElement.dataset.theme).toBe(
    "light",
  );
  act(() => {
    dark = true;
    listeners.forEach((listener) => listener());
  });
  expect(document.documentElement.dataset.theme).toBe(
    "dark",
  );
});

test("blocked writes still allow switching in the current page", () => {
  bootstrap();
  jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("blocked");
    });
  render(<ThemePicker />);
  choose("다크");
  expect(document.documentElement.dataset.theme).toBe(
    "dark",
  );
  expect(
    screen.getByRole("combobox", { name: "화면 테마" }),
  ).toHaveTextContent("다크");
});

test("another tab's preference and removal are reflected without remounting", () => {
  bootstrap();
  render(<ThemePicker />);
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "bugri.theme",
        newValue: "dark",
      }),
    ),
  );
  expect(document.documentElement.dataset.theme).toBe(
    "dark",
  );
  expect(
    screen.getByRole("combobox", { name: "화면 테마" }),
  ).toHaveTextContent("다크");
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "bugri.theme",
        newValue: null,
      }),
    ),
  );
  expect(document.documentElement.dataset.theme).toBe(
    "light",
  );
});
