import { ArrowUpCircle } from 'lucide-react';

export const SampleCard = () => {
  return (
    <div className="card-glass p-6 rounded-2xl">
      <div className="flex items-center space-x-2">
        <ArrowUpCircle className="text-success" />
        <h3 className="text-secondary">Total Income</h3>
      </div>
      <p className="text-3xl font-bold text-foreground mt-2">Rp. 1.500.000</p>
      <button className="mt-4 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-primary-start to-primary-end hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
        View Details
      </button>
    </div>
  );
};