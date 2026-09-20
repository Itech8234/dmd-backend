import { Component } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WarningOctagon, ArrowClockwise } from '@phosphor-icons/react';

class Boundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-ink-800 via-ink-950 to-red-700 text-yellow-300">
          <WarningOctagon size={28} weight="bold" aria-hidden="true" />
        </span>
        <h1 className="h-display mt-5 text-2xl text-balance">{this.props.title || 'Something went wrong'}</h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-200/70">{this.props.msg || 'An error occurred while rendering this page. Reload to continue.'}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn btn-primary mt-6">
          <ArrowClockwise size={16} weight="bold" aria-hidden="true" /> {this.props.reloadLabel || 'Reload page'}
        </button>
        <Link to="/" className="btn btn-outline mt-3">{this.props.homeLabel || 'Back to home'}</Link>
        {this.props.debug && error && (
          <pre className="mt-6 max-h-40 w-full overflow-auto rounded-xl bg-ink-950 p-3 text-left text-[10px] text-ink-100/70">{String(error)}</pre>
        )}
      </div>
    );
  }
}

export default function ErrorBoundary({ children, ...props }) {
  const location = useLocation();
  return (
    <Boundary key={location.pathname} {...props}>{children}</Boundary>
  );
}