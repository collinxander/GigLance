import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeDisabled(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeChecked(): R
      toBeRequired(): R
      toBeValid(): R
      toBeInvalid(): R
      toHaveFocus(): R
      toHaveClass(...classNames: string[]): R
      toHaveStyle(style: Record<string, any>): R
    }
  }
} 