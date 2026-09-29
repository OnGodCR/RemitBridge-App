/**
 * The glossary, ported from the website (src/data/glossary.js) on 2026-09-29 so the app
 * and the site define every word the same way (DECISIONS.md D33, D58). English only for
 * now: the website shows a translation only once a named reviewer has signed off, and the
 * app will follow the same rule when languages arrive.
 *
 * Changed in the port: American spelling (D8), and "exchange-rate margin" is called
 * "exchange-rate markup", the app's term (PRD 14.4). Definitions carry no statistics.
 */
export interface Term {
  id: string;
  term: string;
  plain: string;
}

export const TERMS: Term[] = [
  {
    "id": "remittance",
    "term": "Remittance",
    "plain": "Money a person working in one country sends to family or friends in another. Usually regular, usually small amounts, usually spent on essentials like food, rent, school and medicine."
  },
  {
    "id": "corridor",
    "term": "Corridor",
    "plain": "A sending country and a receiving country, taken as a pair. United States to Mexico is one corridor, United States to India is another. Costs are measured per corridor because they differ enormously between them."
  },
  {
    "id": "mid-market-rate",
    "term": "Mid-market rate",
    "plain": "The midpoint between what banks pay to buy a currency and what they charge to sell it, published daily. It is the fairest available yardstick for an exchange rate, and no provider offers it to customers exactly."
  },
  {
    "id": "exchange-rate-markup",
    "term": "Exchange-rate markup",
    "plain": "The gap between the mid-market rate and the rate a provider actually gives you. Also called the margin or spread. It is a real cost of the transfer, but it does not appear as a fee on the receipt, which is why it is where most of the cost hides."
  },
  {
    "id": "transfer-fee",
    "term": "Transfer fee",
    "plain": "The charge a provider states openly for sending money. It is the number in the advertisement, and it is usually the smaller part of what a transfer really costs."
  },
  {
    "id": "total-cost",
    "term": "Total cost",
    "plain": "The fee plus the exchange-rate markup plus anything charged at pickup, taken together as a share of the amount sent. The only honest way to compare two providers."
  },
  {
    "id": "provider",
    "term": "Provider",
    "plain": "Any business that moves the money: a bank, a money-transfer company, a mobile money service, or a post office. Also called an MTO, for money transfer operator, when it is not a bank."
  },
  {
    "id": "sender",
    "term": "Sender",
    "plain": "The person paying for the transfer, in the country the money leaves."
  },
  {
    "id": "recipient",
    "term": "Recipient",
    "plain": "The person the money is for, in the country it arrives. Some paperwork calls this person the beneficiary."
  },
  {
    "id": "cash-pickup",
    "term": "Cash pickup",
    "plain": "Collecting the transfer as physical cash at an agent, a shop or a branch in the receiving country. Common where the recipient has no bank account, and sometimes carries its own extra charge at the counter."
  },
  {
    "id": "bank-deposit",
    "term": "Bank deposit",
    "plain": "The transfer arrives directly into the recipient’s bank account."
  },
  {
    "id": "mobile-money",
    "term": "Mobile money",
    "plain": "An account that lives on a phone number rather than at a bank, common across Africa and Asia. Transfers can arrive into it like a deposit, and it can be spent or cashed out at agents."
  },
  {
    "id": "settlement",
    "term": "Settlement",
    "plain": "The moment money actually and finally moves between the institutions involved. A transfer can look instant to the sender while settlement between the banks behind it takes days."
  },
  {
    "id": "payment-rails",
    "term": "Payment rails",
    "plain": "The underlying systems money travels on, the way trains travel on tracks. Bank wires, card networks, mobile money systems and blockchains are all different rails with different speeds and costs."
  },
  {
    "id": "swift",
    "term": "SWIFT",
    "plain": "The messaging network banks use to instruct each other across borders. It moves instructions, not money: the money follows by settlement between the banks, which is part of why bank transfers take days."
  },
  {
    "id": "correspondent-bank",
    "term": "Correspondent bank",
    "plain": "A bank in the middle, used because the sending bank and the receiving bank have no direct relationship with each other. It passes the payment along and can take a cut for doing so. One transfer may go through several, and the sender is rarely told how many."
  },
  {
    "id": "nostro-vostro",
    "term": "Nostro and Vostro accounts",
    "plain": "Two names for one account, depending on who is speaking. A bank holding money at another bank calls it a Nostro, meaning ours; the bank holding it calls the same account a Vostro, meaning yours. They are what lets two banks pay each other without any cash moving."
  },
  {
    "id": "rtgs",
    "term": "RTGS",
    "plain": "Real-Time Gross Settlement, the system a country’s banks use to make payments final between themselves, one at a time. It runs during business hours, which is why a transfer handed over on a Friday evening can sit until the next working day."
  },
  {
    "id": "money-transfer-operator",
    "term": "Money transfer operator (MTO)",
    "plain": "A company whose actual business is moving money between people across borders, rather than a bank that offers it alongside everything else. Payout is often cash collected from a local agent instead of a deposit into an account."
  },
  {
    "id": "kyc",
    "term": "KYC",
    "plain": "Know Your Customer: the identity checks a provider runs before it will move money for someone. It is why a transfer can ask for a passport, and why one can be held while the people involved are checked against sanctions lists."
  },
  {
    "id": "pre-funded-pool",
    "term": "Pre-funded pool",
    "plain": "Money a provider keeps waiting in both countries in advance, so a transfer can be paid out on one side without anything arriving from the other. It is why some transfers land in minutes. Nothing crossed a border; the provider squares up with itself later, in bulk."
  },
  {
    "id": "throughput",
    "term": "Throughput",
    "plain": "How much a system can handle in a given time, usually counted in transactions per second. It says nothing about how long any one transfer takes, which is a separate measure."
  },
  {
    "id": "latency",
    "term": "Latency",
    "plain": "How long a single transfer takes from being sent to being finished. A system can have high throughput and bad latency at once: plenty of work getting done, and your payment still waiting."
  },
  {
    "id": "finality",
    "term": "Finality",
    "plain": "The point after which a payment can no longer be reversed or undone. Different systems mean different things by the word, which is why one system being final is not the same claim as another being final."
  },
  {
    "id": "atomicity",
    "term": "Atomicity",
    "plain": "The requirement that a transfer touching several places either completes in all of them or is undone in all of them, with nothing left half done. It is the guarantee that money cannot leave one account without arriving in another."
  },
  {
    "id": "validator",
    "term": "Validator",
    "plain": "A participant that checks transactions and agrees with the other participants on which ones count. How many there are, and how far apart they sit, changes both how quickly a network settles and how hard it is to attack."
  },
  {
    "id": "sharding",
    "term": "Sharding",
    "plain": "Splitting a network’s accounts, and the validators that check them, into separate groups so each group works at the same time as the others. Capacity grows with the number of groups, as long as a transfer only has to touch one of them."
  },
  {
    "id": "sidechain",
    "term": "Sidechain",
    "plain": "A separate chain with its own validators and its own rules, joined to a main chain by a bridge that value crosses in both directions. Its security is its own rather than the main chain’s, which is the part people forget."
  },
  {
    "id": "payment-channel",
    "term": "Payment channel",
    "plain": "A direct link between two parties who lock funds up front, settle any number of payments between themselves off the chain, and record only the opening and closing balances on it. Fast, but the locked money cannot be used for anything else meanwhile."
  },
  {
    "id": "fixed-fee",
    "term": "Fixed fee",
    "plain": "A flat charge that is the same whatever the amount sent. It pays for the parts of a transfer that cost the provider about the same every time, which is why it weighs heaviest on the smallest transfers."
  },
  {
    "id": "percentage-fee",
    "term": "Percentage fee",
    "plain": "A charge that grows with the amount sent, taken as a share of it. Many providers blend one into a fixed fee and publish the sum, so the receipt never says which part is which."
  },
  {
    "id": "recipient-side-charges",
    "term": "Recipient-side charges",
    "plain": "Anything taken out at the receiving end: a commission at the pickup counter, or a deduction by the recipient's own bank for accepting an incoming transfer. The sender is rarely shown it, and often only learns of it when less money arrives than was sent."
  },
  {
    "id": "compliance-checks",
    "term": "Compliance checks",
    "plain": "The screening a provider runs before it moves money: confirming who the sender is and checking both names against sanctions lists. The work costs about the same whatever the amount, which is one reason fixed fees exist."
  },
  {
    "id": "de-risking",
    "term": "De-risking",
    "plain": "A large bank ending its correspondent relationships with smaller banks in markets it judges risky or not worth the compliance cost, rather than screening each one. Payments to those markets then need more hops, and each hop can add a fee."
  },
  {
    "id": "aml",
    "term": "Anti-money-laundering (AML)",
    "plain": "The rules that require a provider to check who is sending money, where it came from and where it is going, and to report anything suspicious. The cost of doing it is roughly fixed per relationship, whatever flows through it."
  },
  {
    "id": "currency-liquidity",
    "term": "Currency liquidity",
    "plain": "How easily a currency can be bought and sold in volume without moving its price. A heavily traded currency is cheap to convert into; a thinly traded one is harder to source, harder to hedge, and the difficulty ends up in the exchange rate."
  },
  {
    "id": "capital-controls",
    "term": "Capital controls",
    "plain": "Government limits on how freely money can enter or leave a country: caps, approvals, or restrictions on holding foreign currency. Every transfer across that border carries the friction they add."
  },
  {
    "id": "last-mile",
    "term": "Last mile",
    "plain": "The final step of getting money into the recipient's hands, after it has arrived in the country: the trip to a pickup agent, the agent's own cut, the cash that has to be physically there. Where the recipient lives far from town, this step alone can be a large share of the cost."
  },
  {
    "id": "diaspora",
    "term": "Diaspora",
    "plain": "The people from one country living in another. A large diaspora on a corridor means a large market for sending money along it, which is what draws providers in and pushes the price down."
  },
  {
    "id": "remittance-channel",
    "term": "Remittance channel",
    "plain": "The route the money takes: a bank transfer, a money transfer operator, mobile money, or an informal carrier. Which one a family uses tends to follow the amount, and the fee structure of each is different."
  },
  {
    "id": "shock",
    "term": "Shock",
    "plain": "An unexpected event that cuts a household's income or raises its costs: an illness, a lost job, a flood, a failed harvest, a conflict. The word researchers use for the thing insurance exists to cover."
  },
  {
    "id": "countercyclical",
    "term": "Countercyclical",
    "plain": "Rising when conditions at home get worse, and easing when they improve. Procyclical is the reverse. Whether remittances behave one way or the other turns out to depend on the country and the kind of shock."
  },
  {
    "id": "coping-strategy",
    "term": "Coping strategy",
    "plain": "What a household does to get through a shock: sell something, eat less, borrow, send a member to work elsewhere. Some cost more later than they raise now; selling the animals that earn next year's income is the expensive kind."
  },
  {
    "id": "capital-flows",
    "term": "Capital flows",
    "plain": "Money crossing borders in any form: investment in businesses, loans, purchases of shares and bonds, aid, remittances. In a crisis the private, profit-seeking kinds tend to reverse fast. Remittances tend not to."
  },
  {
    "id": "originator-bank",
    "term": "Originator bank",
    "plain": "The bank where a payment starts: the sender's own. The only bank in the chain the sender deals with, and the only fee the sender is shown for certain."
  },
  {
    "id": "intermediary-bank",
    "term": "Intermediary bank",
    "plain": "A bank in the middle of the chain that neither the sender nor the recipient chose or can see. It forwards the payment to the next link, and may take its own fee out of it on the way."
  },
  {
    "id": "beneficiary-bank",
    "term": "Beneficiary bank",
    "plain": "The last bank in the chain, the recipient's own, which credits whatever arrives to their account. It sees only what reached it, not what left."
  },
  {
    "id": "charge-codes",
    "term": "SHA, OUR and BEN",
    "plain": "A three-letter code on every SWIFT payment saying who pays the banks in the middle. SHA: shared, each intermediary takes its fee from the money in transit. OUR: the sender pays every fee up front. BEN: the recipient pays all of them, out of what arrives."
  },
  {
    "id": "clearing",
    "term": "Clearing",
    "plain": "The checking stage of a payment: the instruction is sent, both sides reconcile the details, and each confirms what it now owes the other. No money moves. A SWIFT message is a clearing event."
  },
  {
    "id": "ach",
    "term": "ACH",
    "plain": "The Automated Clearing House, the network behind most everyday bank-to-bank payments in the United States, direct deposits and bill payments included. Cheap and batch-processed, and a credit sent through it can be reversed for days afterwards."
  },
  {
    "id": "provisional-credit",
    "term": "Provisional credit",
    "plain": "Money that shows in an account before the payment behind it is final. It can be spent, and it can also be taken back if settlement does not go through. The word is in the account agreement, not on the screen."
  },
  {
    "id": "cutoff-time",
    "term": "Cutoff time",
    "plain": "The time of day after which a bank stops counting new instructions as today's. Miss it by a minute and the transfer starts tomorrow; miss it on a Friday and it starts Monday."
  },
  {
    "id": "batch-processing",
    "term": "Batch processing",
    "plain": "Collecting payments and processing them together at set times rather than one by one as they arrive. Cheaper for the system, and every payment waits for the next window."
  },
  {
    "id": "sanctions-screening",
    "term": "Sanctions screening",
    "plain": "Checking the names on a payment against government lists of people and organizations banks may not deal with, such as the US Treasury's OFAC list. Most matches are a similar name, not the person, and clearing them takes a human."
  },
  {
    "id": "fx-desk",
    "term": "Forex desk",
    "plain": "The part of a bank that buys and sells currency. It keeps its own hours, which are not the branch's, so a payment that needs converting can be held for the desk's next window."
  },
  {
    "id": "swift-mt",
    "term": "SWIFT MT messages",
    "plain": "The older family of SWIFT message formats, numbered by type; an MT103 carries a customer payment. Much of each message is free text, which is why an address can arrive as one unbroken line."
  },
  {
    "id": "straight-through-processing",
    "term": "Straight-through processing",
    "plain": "A payment handled end to end by software, with no person reading it. Anything a machine cannot parse, a truncated address, a name in the wrong field, drops out of that flow into a queue for someone to fix."
  },
  {
    "id": "api",
    "term": "API",
    "plain": "A way for one piece of software to ask another for information or an action directly, without a message file in between. Each bank tends to build its own, which is the message-format problem again in newer clothes."
  },
  {
    "id": "iso-20022",
    "term": "ISO 20022",
    "plain": "The newer standard for financial messages, replacing SWIFT MT. It puts each piece of information in its own labelled field, street, building, postcode, city, country, so that software at the other end can read it without guessing."
  },
  {
    "id": "uetr",
    "term": "UETR",
    "plain": "Unique end-to-end transaction reference: one identifier attached to a payment at the start that every bank along the chain keeps and can look up, instead of each bank knowing the payment only by its own internal number."
  },
  {
    "id": "sepa",
    "term": "SEPA",
    "plain": "The Single Euro Payments Area: the European countries that agreed to run euro payments on one set of rules and formats, so a transfer between two of them works like a domestic one."
  },
  {
    "id": "rpw",
    "term": "Remittance Prices Worldwide (RPW)",
    "plain": "The World Bank's quarterly survey of what it costs to send money, corridor by corridor and provider by provider. Every provider is priced on the same fixed benchmark amount, so a fee in one quarter can be set against a fee in another."
  },
  {
    "id": "reference-rate",
    "term": "Reference rate",
    "plain": "A published daily snapshot of an exchange rate, from a central bank or a data service, used as a yardstick. It is a measuring stick, not a price anyone is offering you."
  },
  {
    "id": "informal-channel",
    "term": "Informal channel",
    "plain": "Sending money outside licensed providers, through a courier, a shopkeeper network or a trusted intermediary. Often cheaper or the only option, but unprotected: if it goes missing there is no complaint to file."
  },
  {
    "id": "money-mule",
    "term": "Money mule",
    "plain": "A person recruited, often through a job offer or a friendship, to receive money and forward it on. The money is usually someone else’s fraud proceeds, and moving it is a crime even when the mule did not know."
  },
  {
    "id": "stablecoin",
    "term": "Stablecoin",
    "plain": "A token that moves on a blockchain and is meant to hold the value of one ordinary currency, usually a dollar, by being backed by reserves held somewhere off the chain."
  },
  {
    "id": "on-ramp",
    "term": "On-ramp",
    "plain": "The regulated point where ordinary money is handed over and turned into a token on a blockchain. Almost always a bank or a licensed institution, because it is the point where the money is real."
  },
  {
    "id": "off-ramp",
    "term": "Off-ramp",
    "plain": "The reverse: the regulated point where a token is turned back into ordinary local currency the recipient can spend. Every transfer that starts on a blockchain still has to come out of one."
  },
  {
    "id": "central-bank-money",
    "term": "Central bank money",
    "plain": "Money held as a balance at a country's own central bank. It cannot fail the way a claim on a commercial bank can, which is why final settlement between banks happens there."
  },
  {
    "id": "legal-tender",
    "term": "Legal tender",
    "plain": "The money a country recognizes for settling a debt: the notes and balances a local shop, landlord or clinic will actually accept. Roughly 200 countries means roughly 200 of them."
  },
  {
    "id": "trust-account",
    "term": "Trust account",
    "plain": "An account where a company holds money that belongs to its customers, kept apart from its own funds so it cannot be spent on the business or lost if the business fails."
  },
  {
    "id": "base-layer",
    "term": "Base layer",
    "plain": "The main blockchain itself, such as Bitcoin or Ethereum, as opposed to systems built on top of it. Every transaction it carries competes for the same limited room in each block."
  },
  {
    "id": "block",
    "term": "Block",
    "plain": "A batch of transactions a blockchain adds to its record in one go. Each chain caps how much a block can hold and how often a new one arrives, which sets how many transactions it can carry at all."
  },
  {
    "id": "gas-limit",
    "term": "Gas limit",
    "plain": "Ethereum's cap on how much computing work a single block may contain. It does the job a fixed block size does on Bitcoin: raising it lets more transactions in, at the cost of heavier blocks for every node to process."
  },
  {
    "id": "fee-auction",
    "term": "Fee auction",
    "plain": "How a busy blockchain decides what goes in the next block: senders attach a fee, and the highest bids are included first. Nothing is rejected outright; a low bid simply waits, or never gets in."
  },
  {
    "id": "confirmation",
    "term": "Confirmation",
    "plain": "One more block added on top of the block holding your transaction. Each one makes the transaction harder to undo, which is why a recipient may wait for several before treating it as done."
  },
  {
    "id": "chain-reorg",
    "term": "Chain reorganization",
    "plain": "When a blockchain swaps its most recent blocks for a competing, longer set, dropping transactions that looked confirmed. Rare, but the reason waiting for more confirmations exists."
  },
  {
    "id": "staking",
    "term": "Staking",
    "plain": "Locking up a blockchain's own currency as a deposit in order to help run the network. On Ethereum it is what an attacker would have to destroy to reverse a finalised transaction."
  },
  {
    "id": "defi",
    "term": "DeFi",
    "plain": "Decentralised finance: lending, trading and other financial services run as programs on a blockchain. Busy periods of it compete for the same block space as everything else on the chain."
  },
  {
    "id": "nft",
    "term": "NFT mint",
    "plain": "Creating new unique tokens, often a collectible series released all at once. A popular release floods the chain with transactions willing to pay high fees."
  }
];
