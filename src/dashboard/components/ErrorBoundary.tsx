import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorObj?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorObj: error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444', borderRadius: '0.5rem', margin: '2rem', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Dashboard Crashed</h2>
          <p style={{ fontWeight: 'bold' }}>{this.state.errorObj?.toString()}</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', backgroundColor: '#fecaca', padding: '1rem', borderRadius: '0.5rem' }}>
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
