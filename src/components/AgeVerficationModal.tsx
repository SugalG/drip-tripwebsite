import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface AgeVerificationModalProps {
  onVerified: () => void;
}

const AgeVerificationModal = ({ onVerified }: AgeVerificationModalProps) => {
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [denied, setDenied] = useState(false);

  const handleOver18 = () => {
    if (!disclaimerChecked) return;
    onVerified();
  };

  const handleUnder18 = () => {
    setDenied(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        >
          {denied ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 backdrop-blur-sm border border-red-400/30">
                <ShieldAlert className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Access Denied</h2>
              <p className="text-white/70 text-sm">
                You must be 18 years or older to access this website. Please close this tab.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <img
                  src={logo}
                  alt="Drip and Trip"
                  className="h-20 w-auto mx-auto drop-shadow-lg"
                />
                <h2 className="text-2xl font-bold text-white">
                  Age Verification Required
                </h2>
                <p className="text-white/70 text-sm">
                  You must be at least{" "}
                  <span className="font-semibold text-primary">18 years old</span>{" "}
                  to enter this website. Please confirm your age below.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleOver18}
                  disabled={!disclaimerChecked}
                  className="w-full h-14 text-base font-semibold rounded-2xl gradient-button text-white border border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100"
                >
                  I am over 18 years old
                </Button>

                <Button
                  onClick={handleUnder18}
                  variant="destructive"
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-red-600 text-white border border-red-500/30 backdrop-blur-sm shadow-lg hover:bg-red-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  I am not above 18 years old
                </Button>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-3">
                <Checkbox
                  id="disclaimer"
                  checked={disclaimerChecked}
                  onCheckedChange={(checked) =>
                    setDisclaimerChecked(checked === true)
                  }
                  className="mt-0.5 border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />

                <label
                  htmlFor="disclaimer"
                  className="text-xs leading-relaxed text-white/60 cursor-pointer select-none"
                >
                  By checking this box, I acknowledge that{" "}
                  <strong className="text-white/90">Drip and Trip</strong> is not
                  responsible for any actions made through this web app if the user
                  provides false information about their age and continues to use it.
                </label>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgeVerificationModal;