import { render } from '@redwoodjs/testing/web'

import LoginCallbackPage from './LoginCallbackPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('LoginCallbackPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<LoginCallbackPage />)
    }).not.toThrow()
  })
})
