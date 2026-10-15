import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { Button } from '../../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 anim-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="eyebrow text-ink-500">404 · Not found</div>
        <h1 className="display-md mt-3">This page is off the map.</h1>
        <p className="text-ink-500 text-[15px] mt-3 leading-relaxed">
          The page you’re looking for doesn’t exist — or has been moved. From
          here you can head back to the landing page or open the marketplace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn btn-secondary btn-md">
            <Compass className="w-4 h-4" /> Home
          </Link>
          <Link to="/login" className="btn btn-primary btn-md">
            Open the app <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
