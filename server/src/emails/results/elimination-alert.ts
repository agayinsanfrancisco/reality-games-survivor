import { emailWrapper, button } from '../base.js';

interface EliminationAlertEmailParams {
  displayName: string;
  leagueName: string;
  castawayName: string;
  episodeNumber: number;
  leagueId: string;
}

export function eliminationAlertEmail({
  displayName,
  leagueName,
  castawayName,
  episodeNumber,
  leagueId,
}: EliminationAlertEmailParams): string {
  return emailWrapper(`
    <h1>🔥 Castaway Eliminated</h1>
    <p>Hey ${displayName},</p>
    <p>Bad news from the island... <span style="color: #ef4444;">${castawayName}</span> has been voted out in Episode ${episodeNumber}.</p>

    <div class="card" style="text-align: center; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);">
      <div style="font-size: 64px;">🔥</div>
      <p style="color: #ef4444; font-weight: bold; font-size: 24px; margin: 8px 0;">${castawayName}</p>
      <p style="color: #b8a; margin: 0;">The tribe has spoken.</p>
    </div>

    <div class="card">
      <h2>What Now?</h2>
      <p>You still have your other castaway to play for. If both of your castaways have been eliminated, your season is over but you can still follow along with the standings!</p>
    </div>

    ${button('View League', `https://rgfl.app/leagues/${leagueId}`)}

    <p>Keep playing - there's still plenty of game left!</p>
  `, `😢 ${castawayName} eliminated in Episode ${episodeNumber}`);
}
