import { Server, Database, Mail, CreditCard, Cog, Loader2 } from 'lucide-react';

interface ServiceStatus {
  status: string;
  message: string;
  latencyMs?: number | null;
  pending?: number;
  failed?: number;
  failedLast24h?: number;
}

interface SystemStatusProps {
  status?: {
    status: 'operational' | 'degraded' | 'down';
    services: {
      api: ServiceStatus;
      database: ServiceStatus;
      email: ServiceStatus;
      payments: ServiceStatus;
      jobs: ServiceStatus;
    };
    lastChecked: string;
  };
  isLoading: boolean;
}

const serviceIcons = {
  api: Server,
  database: Database,
  email: Mail,
  payments: CreditCard,
  jobs: Cog,
};

const serviceLabels = {
  api: 'API',
  database: 'Database',
  email: 'Email',
  payments: 'Payments',
  jobs: 'Jobs',
};

function StatusIndicator({ status }: { status: string }) {
  const colors = {
    up: 'bg-green-400',
    degraded: 'bg-amber-400',
    down: 'bg-red-400',
  };

  return (
    <span
      className={`w-2 h-2 rounded-full ${colors[status as keyof typeof colors] || 'bg-neutral-400'}`}
    />
  );
}

export function SystemStatusPanel({ status, isLoading }: SystemStatusProps) {
  if (isLoading) {
    return (
      <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          System Status
        </h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 text-neutral-500 animate-spin" />
        </div>
      </div>
    );
  }

  const services = status?.services || {};

  return (
    <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
      <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
        System Status
      </h3>

      <div className="space-y-3">
        {Object.entries(services).map(([key, service]) => {
          const Icon = serviceIcons[key as keyof typeof serviceIcons] || Server;
          const label = serviceLabels[key as keyof typeof serviceLabels] || key;
          const serviceData = service as ServiceStatus;

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-neutral-500" />
                <span className="text-sm text-neutral-300">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status={serviceData.status} />
                <span
                  className={`text-xs ${
                    serviceData.status === 'up'
                      ? 'text-green-400'
                      : serviceData.status === 'degraded'
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {serviceData.status.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {status?.lastChecked && (
        <div className="mt-4 pt-3 border-t border-neutral-700">
          <span className="text-xs text-neutral-500">
            Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
