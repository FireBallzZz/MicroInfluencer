import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-extrabold text-ink-200">404</div>
        <h1 className="text-2xl font-bold text-ink-900 mt-2">Page not found</h1>
        <p className="text-ink-600 mt-2">The page you’re looking for doesn’t exist or has been moved.</p>
        <div className="mt-6"><Link to="/"><Button>Back to home</Button></Link></div>
      </div>
    </div>
  );
}