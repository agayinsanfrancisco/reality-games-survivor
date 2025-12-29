/**
 * Trivia Conversion CTA Component
 * Encourages users to join leagues after completing trivia
 */
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export function TriviaConversionCTA() {
  return (
    <div className="mt-8 bg-gradient-to-r from-burgundy-500 to-burgundy-600 rounded-2xl p-8 text-white text-center shadow-lg">
      <Trophy className="h-12 w-12 mx-auto mb-4" />
      <h3 className="text-2xl font-display font-bold mb-2">
        Ready to Play for Real?
      </h3>
      <p className="text-burgundy-100 mb-6 max-w-lg mx-auto">
        Join Season 50 and compete in fantasy leagues. Draft castaways, make weekly picks, and prove you're the ultimate Survivor fan!
      </p>
      <Link
        to="/dashboard"
        className="inline-block bg-white text-burgundy-600 font-bold px-8 py-4 rounded-xl hover:bg-cream-100 transition-colors"
      >
        Join a League Now
      </Link>
    </div>
  );
}
