import { z } from 'zod';

const passwordErrorMessage =
  'Please make sure to enter minimum one lowercase letter, one capitalcase letter, one number and a total of minimum 8 characters';
const usernameErrorMessage =
  'Username must be composed of lowercase letters, numbers of a combination of both';

// REGEX
const regexUsername = new RegExp(/^[a-z0-9]+$/i);
const regexPassword = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/);

// DEFAULT VALUES
const loginModel = {
  username: '',
  password: '',
};

const signupModel = {
  username: '',
  email: '',
  password: '',
};

const forgotPasswordModel = {
  email: '',
};

const resetPasswordModel = {
  password: '',
};

// SCHEMAS

// const alphaNumericSchema = z.custom((val) => {
//   return typeof val === 'string' ? /^[a-z0-9]+$/i.test(val) : false;
// });

const usernameSchema = {
  username: z
    .string({
      required_error: usernameErrorMessage,
      invalid_type_error: usernameErrorMessage,
    })
    .regex(regexUsername),
  // .refine((value) => regexUsername.test(value)),
};

const emailSchema = {
  email: z.string().email('This is not a valid email'),
};

const usernameOrEmailSchema = {
  username: z.union([usernameSchema.username, emailSchema.email]),
};

const passwordSchema = {
  password: z
    .string({
      required_error: passwordErrorMessage,
      invalid_type_error: passwordErrorMessage,
    })
    .regex(regexPassword),
  // .refine((value) => regexPassword.test(value)),
};

export {
  regexPassword,
  loginModel,
  signupModel,
  forgotPasswordModel,
  resetPasswordModel,
  usernameSchema,
  emailSchema,
  usernameOrEmailSchema,
  passwordSchema,
};
