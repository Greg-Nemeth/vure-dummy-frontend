import { html } from 'lit';
import '../src/login-screen.js';

export default {
  title: 'Login/LoginScreen',
  component: 'login-screen',
  argTypes: {
    heading: { control: 'text' },
    email: { control: 'text' },
    password: { control: 'text' },
    errorMessage: { control: 'text' },
  },
};

const Template = ({ heading, email, password, errorMessage }) => html`
  <login-screen
    .heading=${heading}
    .email=${email}
    .password=${password}
    .errorMessage=${errorMessage}
  >
    <a slot="helper" href="#">Forgot password?</a>
    <a slot="action" href="#">Create account</a>
  </login-screen>
`;

export const Default = Template.bind({});
Default.args = {
  heading: 'Sign in to your account',
  email: '',
  password: '',
  errorMessage: '',
};

export const WithError = Template.bind({});
WithError.args = {
  ...Default.args,
  errorMessage: 'We couldn\'t find an account with those credentials.',
};
