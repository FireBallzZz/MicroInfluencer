import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';

export default function Unauthorized() {
  return (
    <div className="max-w-md mx-auto py-20 text-center px-4">
      <h1 className="text-2xl font-bold text-ink-900">Not authorized</h1>
      <p className="text-ink-600 mt-2">You don’t have access to that page. Try logging in with the right account.</p>
      <div className="mt-6 flex gap-2 justify-center">
        <Link to="/login"><Button>Switch account</Button></Link>
        <Link to="/"><Button variant="secondary">Back to home</Button></Link>
      </div>
    </div>
  );
}