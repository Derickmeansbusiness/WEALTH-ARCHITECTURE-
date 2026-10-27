import { Component, type ReactNode } from 'react';
import { ErrorState } from '@/components/ui';

interface Props { children: ReactNode; title?: string; fallback?: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error) { if (import.meta.env.DEV) console.error('[debt-studio]', error); }
  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorState title={this.props.title ?? 'This part of the studio failed to render'} body={this.state.error.message} retry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
