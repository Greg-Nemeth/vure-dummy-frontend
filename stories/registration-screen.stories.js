import { html } from 'lit';
import '../src/registration-screen.js';

export default {
  title: 'Auth/RegistrationScreen',
  component: 'registration-screen',
  argTypes: {
    heading: { control: 'text' },
    username: { control: 'text' },
    password: { control: 'text' },
    errorMessage: { control: 'text' },
  },
};

const Template = ({ heading, username, password, errorMessage }) => html`
  <registration-screen
    .heading=${heading}
    .username=${username}
    .password=${password}
    .errorMessage=${errorMessage}
  >
    <a slot="helper" href="#">Already have an account?</a>
  </registration-screen>
`;

export const Default = Template.bind({});
Default.args = {
  heading: 'Create your account',
  username: '',
  password: '',
  errorMessage: '',
};

export const WithError = Template.bind({});
WithError.args = {
  ...Default.args,
  errorMessage: 'That email is already registered. Try signing in instead.',
};
