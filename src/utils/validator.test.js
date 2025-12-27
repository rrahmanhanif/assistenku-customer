import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalize,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateOTP,
  validateText,
} from "./validator.js";

describe("validator utils", () => {
  it("normalizes text safely", () => {
    const raw = "  <Hello>  Dunia  ";
    assert.equal(normalize(raw), "Hello Dunia");
  });

  it("validates email formats", () => {
    assert.equal(validateEmail("user@example.com"), true);
    assert.equal(validateEmail("bad-email"), false);
  });

  it("validates password length", () => {
    assert.equal(validatePassword("12345"), false);
    assert.equal(validatePassword("123456"), true);
  });

  it("validates person names", () => {
    assert.equal(validateName("A"), false);
    assert.equal(validateName("Nur D'ini"), true);
  });

  it("validates Indonesian phone numbers", () => {
    assert.equal(validatePhone("081234567890"), true);
    assert.equal(validatePhone("+6281234567890"), true);
    assert.equal(validatePhone("712345"), false);
  });

  it("validates OTP code length and format", () => {
    assert.equal(validateOTP("123"), false);
    assert.equal(validateOTP("12345"), true);
  });

  it("validates free text inputs", () => {
    assert.equal(validateText(""), false);
    assert.equal(validateText(" Halo "), true);
  });
});
