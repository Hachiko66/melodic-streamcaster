import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';
import { ethers } from 'ethers';

interface WalletConnectProps {
  currentStation: {
    name: string;
    tipAddress?: string;
  } | null;
}

const WalletConnect = ({ currentStation }: WalletConnectProps) => {
  const [account, setAccount] = useState<string>('');
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to use this feature.",
          variant: "destructive",
        });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      
      console.log("Wallet connected:", accounts[0]);
      
      toast({
        title: "Wallet Connected",
        description: "Your MetaMask wallet has been connected successfully!",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendTip = async () => {
    try {
      if (!currentStation?.tipAddress) {
        toast({
          title: "Tip Address Missing",
          description: "This station doesn't have a tip address configured.",
          variant: "destructive",
        });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: currentStation.tipAddress,
        value: ethers.parseEther("0.01"), // 0.01 ETH tip
      });

      console.log("Tip transaction:", tx.hash);
      
      toast({
        title: "Tip Sent!",
        description: "Thank you for supporting the station!",
      });
    } catch (error) {
      console.error("Error sending tip:", error);
      toast({
        title: "Tip Error",
        description: "Failed to send tip. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      {!account ? (
        <Button 
          onClick={connectWallet}
          className="w-full bg-[#C0C0C0] text-black hover:bg-[#A0A0A0] border-t border-l border-[#FFFFFF] border-b border-r border-[#555555]"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="text-[#C0C0C0] text-xs truncate">
            Connected: {account}
          </div>
          <Button
            onClick={sendTip}
            className="w-full bg-[#C0C0C0] text-black hover:bg-[#A0A0A0] border-t border-l border-[#FFFFFF] border-b border-r border-[#555555]"
          >
            Send 0.01 ETH Tip
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;