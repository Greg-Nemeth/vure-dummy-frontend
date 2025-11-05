import { html } from 'lit';
import '../src/vulnerable-display.js';

export default {
  title: 'VulnerableDisplay',
  component: 'vulnerable-display',
  argTypes: {
    userInput: { control: 'text' },
  },
};

function Template({ userInput }) {
  return html`
    <vulnerable-display .userInput=${userInput}></vulnerable-display>
  `;
}

export const Default = Template.bind({});
Default.args = {
  userInput: 'Hello, world!',
};

export const XssAttempt = Template.bind({});
XssAttempt.args = {
  userInput: '<img src=x onerror=alert("XSS")>',
};
