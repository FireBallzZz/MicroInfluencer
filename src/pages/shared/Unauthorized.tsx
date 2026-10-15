import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { Button } from '../../components/ui';

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboard = user
    ? user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'
    : '/login';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 anim-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-ink-100 text-ink-700 rounded-md mb-4">
          <ShieldOff className="w-5 h-5" />
        </div>
        <div className="eyebrow text-ink-500">403 · Wrong side of the wall</div>
        <h1 className="display-md mt-3">You’re on the wrong side.</h1>
        <p className="text-ink-500 text-[15px] mt-3 leading-relaxed">
          {user
            ? `You’re signed in as a ${user.role}. This page is for the other role.`
            : 'You need to be signed in to view this page.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={() => { logout(); navigate('/'); }}>Switch role</Button>
          <Link to={dashboard} className="btn btn-primary btn-md">
            My dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
