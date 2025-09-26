import { html } from 'lit';
import '../src/dummy-application.js';

export default {
  title: 'DummyApplication',
  component: 'dummy-application',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

function Template({ header, backgroundColor }) {
  return html`
    <dummy-application
      style="--dummy-application-background-color: ${backgroundColor || 'white'}"
      .header=${header}
    >
    </dummy-application>
  `;
}

export const App = Template.bind({});
App.args = {
  header: 'My app',
};
