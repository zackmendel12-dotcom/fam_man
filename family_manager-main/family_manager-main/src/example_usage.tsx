import { 
  useRegisterChild,
  useFundChild,
  useChildBalance,
  useChildLimits,
  useUpdateChildLimits,
  usePauseChild,
  useChildSpend,
  useTransactionStream,
  toUsdcAmount,
  formatUsdcAmount,
  type ChildLimits
} from "./hooks/use_family_manager";

export function FamilyManagerExample() {
  const childAddress = "0x..." as `0x${string}`;
  
  const { balanceFormatted, isLoading: balanceLoading } = useChildBalance(childAddress);
  const { data: limits, isLoading: limitsLoading } = useChildLimits(childAddress);
  const { transactions } = useTransactionStream();
  
  const { write: registerChild, isPending: isRegistering, error: registerError } = useRegisterChild();
  const { write: fundChild, isPending: isFunding, error: fundError } = useFundChild();
  const { write: updateLimits, isPending: isUpdatingLimits } = useUpdateChildLimits();
  const { write: pauseChild, isPending: isPausing } = usePauseChild();
  const { write: spend, isPending: isSpending } = useChildSpend();

  const handleRegister = async () => {
    try {
      await registerChild(childAddress);
      console.log("Child registered successfully");
    } catch (err) {
      console.error("Failed to register child:", err);
    }
  };

  const handleFund = async () => {
    try {
      const amount = toUsdcAmount(100);
      await fundChild(childAddress, amount);
      console.log("Child funded successfully");
    } catch (err) {
      console.error("Failed to fund child:", err);
    }
  };

  const handleUpdateLimits = async () => {
    try {
      const newLimits: ChildLimits = {
        daily: toUsdcAmount(50),
        weekly: toUsdcAmount(200),
        monthly: toUsdcAmount(500),
      };
      await updateLimits(childAddress, newLimits);
      console.log("Limits updated successfully");
    } catch (err) {
      console.error("Failed to update limits:", err);
    }
  };

  const handlePause = async () => {
    try {
      await pauseChild(childAddress, true);
      console.log("Child account paused");
    } catch (err) {
      console.error("Failed to pause child:", err);
    }
  };

  const handleSpend = async () => {
    try {
      const recipientAddress = "0x..." as `0x${string}`;
      const amount = toUsdcAmount(10);
      const categoryId = 1;
      await spend(recipientAddress, amount, categoryId);
      console.log("Spent successfully");
    } catch (err) {
      console.error("Failed to spend:", err);
    }
  };

  return (
    <div>
      <h1>Family Manager Example</h1>
      
      <div>
        <h2>Child Balance</h2>
        {balanceLoading ? (
          <p>Loading...</p>
        ) : (
          <p>Balance: ${balanceFormatted} USDC</p>
        )}
      </div>

      <div>
        <h2>Child Limits</h2>
        {limitsLoading ? (
          <p>Loading...</p>
        ) : limits ? (
          <ul>
            <li>Daily: ${formatUsdcAmount(limits.daily)} USDC</li>
            <li>Weekly: ${formatUsdcAmount(limits.weekly)} USDC</li>
            <li>Monthly: ${formatUsdcAmount(limits.monthly)} USDC</li>
          </ul>
        ) : (
          <p>No limits set</p>
        )}
      </div>

      <div>
        <h2>Actions</h2>
        <button onClick={handleRegister} disabled={isRegistering}>
          {isRegistering ? "Registering..." : "Register Child"}
        </button>
        {registerError && <p style={{ color: "red" }}>{registerError}</p>}
        
        <button onClick={handleFund} disabled={isFunding}>
          {isFunding ? "Funding..." : "Fund Child ($100)"}
        </button>
        {fundError && <p style={{ color: "red" }}>{fundError}</p>}
        
        <button onClick={handleUpdateLimits} disabled={isUpdatingLimits}>
          {isUpdatingLimits ? "Updating..." : "Update Limits"}
        </button>
        
        <button onClick={handlePause} disabled={isPausing}>
          {isPausing ? "Pausing..." : "Pause Child"}
        </button>
        
        <button onClick={handleSpend} disabled={isSpending}>
          {isSpending ? "Spending..." : "Spend ($10)"}
        </button>
      </div>

      <div>
        <h2>Recent Transactions</h2>
        <ul>
          {transactions.map((event, index) => (
            <li key={index}>
              <strong>{event.type}</strong> - {new Date(event.timestamp).toLocaleString()}
              {event.txHash && (
                <a href={`https://sepolia.basescan.org/tx/${event.txHash}`} target="_blank" rel="noopener noreferrer">
                  View Transaction
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
