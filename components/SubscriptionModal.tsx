
import React from 'react';
import { Check, Crown, Shield, Zap, X } from 'lucide-react';
import { PlanTier } from '../types';
import { useLanguage } from '../i18n';

interface SubscriptionModalProps {
  currentPlan: PlanTier;
  onSelectPlan: (plan: PlanTier) => void;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ currentPlan, onSelectPlan, onClose }) => {
  const { t } = useLanguage();

  const plans = [
    {
        id: PlanTier.FREE,
        name: t('plan.free'),
        price: '$0',
        features: ['Basic Tasks', 'Notes', 'Calendar', 'Workouts', 'Ads Enabled'],
        color: 'bg-slate-100 border-slate-200 text-slate-900'
    },
    {
        id: PlanTier.STANDARD,
        name: t('plan.standard'),
        price: '$5/mo',
        features: [t('plan.feature_ads'), t('plan.feature_themes'), 'Priority Support', 'All Free Features'],
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        popular: true
    },
    {
        id: PlanTier.PRO,
        name: t('plan.pro'),
        price: '$12/mo',
        features: [t('plan.feature_ai'), t('plan.feature_game'), t('plan.feature_sync'), 'Early Access'],
        color: 'bg-indigo-900 border-indigo-700 text-white'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 z-10">
            <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('plan.upgrade_title')}</h2>
            <p className="text-slate-500 dark:text-slate-400">Choose the plan that fits your workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-0">
            {plans.map(plan => {
                const isCurrent = currentPlan === plan.id;
                return (
                    <div key={plan.id} className={`rounded-2xl border-2 p-6 flex flex-col relative ${isCurrent ? 'border-green-500 shadow-lg ring-1 ring-green-500' : 'border-slate-200 dark:border-slate-700'} ${plan.id === PlanTier.PRO ? 'dark:bg-indigo-950' : 'dark:bg-slate-900'}`}>
                        {plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>}
                        <h3 className="text-lg font-bold mb-2 dark:text-white">{plan.name}</h3>
                        <div className="text-3xl font-bold mb-6 dark:text-white">{plan.price}</div>
                        
                        <ul className="space-y-3 mb-8 flex-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button 
                            disabled={isCurrent}
                            onClick={() => onSelectPlan(plan.id)}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                isCurrent 
                                ? 'bg-green-100 text-green-700 cursor-default' 
                                : plan.id === PlanTier.PRO 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                        >
                            {isCurrent ? t('plan.current') : t('plan.btn_upgrade')}
                        </button>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
