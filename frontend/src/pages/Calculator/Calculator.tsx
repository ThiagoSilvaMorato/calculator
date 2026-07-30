import { Text } from "../../components/Text";
import { CalculatorForm } from "./components/CalculatorForm";
import { useCalculator } from "./hooks/useCalculator";

export function Calculator() {
  const calculator = useCalculator();

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8'>
      <div className='w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <Text as='h1' className='mb-6 text-center text-2xl font-bold text-gray-900'>
          Calculator
        </Text>
        <CalculatorForm {...calculator} />
      </div>
    </div>
  );
}
