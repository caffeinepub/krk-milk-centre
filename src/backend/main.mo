import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Type Definitions
  type ProducerId = Nat;
  type LoanId = Nat;

  module Producer {
    public type Type = {
      name : Text;
      phone : Text;
      producerNumber : Text;
      canSelfView : Bool;
    };

    public func compareByProducerNumber(p1 : Type, p2 : Type) : Order.Order {
      Text.compare(p1.producerNumber, p2.producerNumber);
    };
  };

  module MilkEntry {
    public type Type = {
      producerId : ProducerId;
      date : Text;
      session : Text; // "morning" or "evening"
      litres : Float;
      fatPercent : Float;
      ratePerLitre : Float;
      amount : Float;
    };
  };

  module Loan {
    public type Type = {
      id : LoanId;
      producerId : ProducerId;
      date : Text;
      amount : Float;
      purpose : Text;
      remainingBalance : Float;
      repayments : List.List<Repayment.Type>;
    };
  };

  module Advance {
    public type Type = {
      producerId : ProducerId;
      date : Text;
      amount : Float;
      reason : Text;
    };
  };

  module Repayment {
    public type Type = {
      loanId : LoanId;
      producerId : ProducerId;
      date : Text;
      amount : Float;
    };
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // State
  var nextProducerId = 1;
  var nextLoanId = 1;

  let producers = Map.empty<ProducerId, Producer.Type>();
  let milkEntries = List.empty<MilkEntry.Type>();
  let loans = Map.empty<LoanId, Loan.Type>();
  let advances = List.empty<Advance.Type>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authentication setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Producer Management
  public shared ({ caller }) func addProducer(name : Text, phone : Text, producerNumber : Text) : async ProducerId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add producers");
    };

    let id = nextProducerId;
    nextProducerId += 1;

    let producer : Producer.Type = {
      name;
      phone;
      producerNumber;
      canSelfView = false;
    };

    producers.add(id, producer);
    id;
  };

  public shared ({ caller }) func setSelfViewPermission(producerId : ProducerId, canSelfView : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set self view permission");
    };

    let producer = switch (producers.get(producerId)) {
      case (null) { Runtime.trap("Producer not found") };
      case (?p) { p };
    };

    let updatedProducer : Producer.Type = {
      name = producer.name;
      phone = producer.phone;
      producerNumber = producer.producerNumber;
      canSelfView;
    };

    producers.add(producerId, updatedProducer);
  };

  public query ({ caller }) func getProducerById(producerId : ProducerId) : async ?Producer.Type {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access producer details");
    };
    producers.get(producerId);
  };

  public query ({ caller }) func getProducerByPhone(phone : Text) : async ?Producer.Type {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access producer details");
    };
    producers.values().find(
      func(p) { p.phone == phone }
    );
  };

  // Milk Collection
  public shared ({ caller }) func recordMilkEntry(producerId : ProducerId, date : Text, session : Text, litres : Float, fatPercent : Float, ratePerLitre : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record milk entries");
    };

    let id = milkEntries.size() + 1;
    let amount = litres * ratePerLitre;
    let entry : MilkEntry.Type = {
      producerId;
      date;
      session;
      litres;
      fatPercent;
      ratePerLitre;
      amount;
    };

    milkEntries.add(entry);
    id;
  };

  // Financial Management
  public shared ({ caller }) func recordLoan(producerId : ProducerId, date : Text, amount : Float, purpose : Text) : async LoanId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record loans");
    };

    let id = nextLoanId;
    nextLoanId += 1;

    let loan : Loan.Type = {
      id;
      producerId;
      date;
      amount;
      purpose;
      remainingBalance = amount;
      repayments = List.empty<Repayment.Type>();
    };

    loans.add(id, loan);
    id;
  };

  public shared ({ caller }) func recordAdvance(producerId : ProducerId, date : Text, amount : Float, reason : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record advances");
    };

    let id = advances.size() + 1;
    let advance : Advance.Type = {
      producerId;
      date;
      amount;
      reason;
    };

    advances.add(advance);
    id;
  };

  // Producer Self-View
  // This function is intentionally accessible to anyone (including guests/anonymous)
  // because it's designed for producers to view their own data without authentication
  // The security is based on knowing the phone number and having canSelfView enabled
  public query func getMyHistory(phone : Text) : async {
    producer : Producer.Type;
    milkEntries : [MilkEntry.Type];
    advances : [Advance.Type];
  } {
    // Find producer by phone
    let producerEntry = producers.entries().find(
      func((id, p) : (ProducerId, Producer.Type)) : Bool { p.phone == phone }
    );

    let (producerId, producer) = switch (producerEntry) {
      case (null) { Runtime.trap("Producer not found") };
      case (?(id, p)) { (id, p) };
    };

    if (not producer.canSelfView) {
      Runtime.trap("Self-view not enabled for this producer");
    };

    let entries = milkEntries.filter(func(e) { e.producerId == producerId });
    let advancesForProducer = advances.filter(func(a) { a.producerId == producerId });

    {
      producer;
      milkEntries = entries.toArray();
      advances = advancesForProducer.toArray();
    };
  };
};
