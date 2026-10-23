import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichText } from "./richtext";

describe("RichText", () => {
  it("==키워드==를 <mark>로 바꾼다", () => {
    const html = renderToStaticMarkup(<RichText text="==클로저==는 ==렉시컬 환경==을 기억합니다" />);
    expect(html).toBe("<mark>클로저</mark>는 <mark>렉시컬 환경</mark>을 기억합니다");
  });

  it("마크가 없는 일반 텍스트는 그대로 둔다", () => {
    const html = renderToStaticMarkup(<RichText text="그냥 평범한 문장입니다" />);
    expect(html).toBe("그냥 평범한 문장입니다");
  });

  it("빈 문자열은 빈 결과를 낸다", () => {
    const html = renderToStaticMarkup(<RichText text="" />);
    expect(html).toBe("");
  });

  it("HTML 문자열을 직접 만들지 않으므로 <script> 같은 입력도 그대로 글자로 보여진다", () => {
    const html = renderToStaticMarkup(<RichText text="<script>alert(1)</script>" />);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
