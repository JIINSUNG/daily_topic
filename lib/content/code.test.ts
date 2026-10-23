import { describe, expect, it } from "vitest";
import { describeCode, hasLangToggle, isJsOnly, pickCode, resolveLang } from "./code";

describe("resolveLang / pickCode", () => {
  it("js와 py가 둘 다 있을 때 선호 언어를 그대로 쓴다", () => {
    const code = { js: "console.log(1)", py: "print(1)" };
    expect(resolveLang(code, "js")).toBe("js");
    expect(resolveLang(code, "py")).toBe("py");
    expect(pickCode(code, "py")).toBe("print(1)");
  });

  it("py를 선호해도 py가 없으면 js로 대체한다", () => {
    const code = { js: "console.log(1)" };
    expect(resolveLang(code, "py")).toBe("js");
    expect(pickCode(code, "py")).toBe("console.log(1)");
  });

  it("js도 py도 없고 flow만 있으면 flow로 대체한다", () => {
    const code = { flow: "요청 → 응답" };
    expect(resolveLang(code, "js")).toBe("flow");
    expect(resolveLang(code, "py")).toBe("flow");
    expect(pickCode(code, "js")).toBe("요청 → 응답");
  });

  it("js가 없고 py만 있으면(선호가 js라도) py로 대체한다", () => {
    const code = { py: "print(1)" };
    expect(resolveLang(code, "js")).toBe("py");
  });
});

describe("hasLangToggle / isJsOnly", () => {
  it("js+py가 모두 있을 때만 토글을 보여준다", () => {
    expect(hasLangToggle({ js: "a", py: "b" })).toBe(true);
    expect(hasLangToggle({ js: "a" })).toBe(false);
    expect(hasLangToggle({ flow: "a" })).toBe(false);
  });

  it("js만 있는 코드는 JS 전용으로 표시한다", () => {
    expect(isJsOnly({ js: "a" })).toBe(true);
    expect(isJsOnly({ js: "a", py: "b" })).toBe(false);
    expect(isJsOnly({ flow: "a" })).toBe(false);
  });
});

describe("describeCode", () => {
  it("js+py 코드에서 py를 선호하면 Python 라벨과 토글 노출을 함께 돌려준다", () => {
    const view = describeCode({ js: "console.log(1)", py: "print(1)" }, "py");
    expect(view).toEqual({
      lang: "py",
      label: "Python",
      code: "print(1)",
      showLangToggle: true,
      jsOnlyNote: false,
    });
  });

  it("js 전용 코드는 jsOnlyNote가 true이고 토글은 안 보여준다", () => {
    const view = describeCode({ js: "console.log(1)" }, "py");
    expect(view.lang).toBe("js");
    expect(view.showLangToggle).toBe(false);
    expect(view.jsOnlyNote).toBe(true);
  });

  it("flow 전용 코드는 흐름 라벨을 쓴다", () => {
    const view = describeCode({ flow: "A → B" }, "js");
    expect(view.label).toBe("흐름");
    expect(view.jsOnlyNote).toBe(false);
  });
});
