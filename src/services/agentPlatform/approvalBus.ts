/**
 * AlphaFlow S-Tier Agent Platform - Human-in-the-Loop (HITL) Approval Bus
 * 
 * Rules:
 * 1. Any agent action marked with 'execute' or 'write' (e.g. order execution, memory alteration)
 *    creates a pending approval ticket.
 * 2. The user is prompted with an interactive dialog displaying all trade parameters.
 * 3. Traders can approve, reject, or adjust before execution.
 * 4. Default mode is always Paper Simulation.
 */

export interface PendingActionTicket {
  id: string;
  runId: string;
  agentName: string;
  toolId: string;
  title: string;
  payload: Record<string, unknown>;
  createdAt: number;
  expiresAt: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
}

type ApprovalListener = (tickets: PendingActionTicket[]) => void;

class HumanApprovalBus {
  private tickets: PendingActionTicket[] = [];
  private listeners: ApprovalListener[] = [];
  private resolvers = new Map<string, (approved: boolean) => void>();

  /**
   * Request human-in-the-loop approval.
   * Returns a promise that resolves when the user approves or rejects.
   */
  public requestApproval(params: {
    runId: string;
    agentName: string;
    toolId: string;
    title: string;
    payload: Record<string, unknown>;
    timeoutSeconds?: number;
  }): Promise<boolean> {
    const ticketId = `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timeout = (params.timeoutSeconds || 60) * 1000;

    const ticket: PendingActionTicket = {
      id: ticketId,
      runId: params.runId,
      agentName: params.agentName,
      toolId: params.toolId,
      title: params.title,
      payload: params.payload,
      createdAt: Date.now(),
      expiresAt: Date.now() + timeout,
      status: "PENDING",
    };

    this.tickets.unshift(ticket);
    this.notify();

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        if (ticket.status === "PENDING") {
          ticket.status = "EXPIRED";
          this.resolvers.delete(ticketId);
          this.notify();
          resolve(false);
        }
      }, timeout);

      this.resolvers.set(ticketId, (approved) => {
        clearTimeout(timer);
        ticket.status = approved ? "APPROVED" : "REJECTED";
        this.resolvers.delete(ticketId);
        this.notify();
        resolve(approved);
      });
    });
  }

  public approve(ticketId: string): void {
    const resolver = this.resolvers.get(ticketId);
    if (resolver) resolver(true);
  }

  public reject(ticketId: string): void {
    const resolver = this.resolvers.get(ticketId);
    if (resolver) resolver(false);
  }

  public getPendingTickets(): PendingActionTicket[] {
    return this.tickets.filter((t) => t.status === "PENDING" && Date.now() < t.expiresAt);
  }

  public getAllTickets(): PendingActionTicket[] {
    return [...this.tickets];
  }

  public subscribe(listener: ApprovalListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const pending = this.getPendingTickets();
    this.listeners.forEach((l) => l(pending));
  }
}

export const approvalBus = new HumanApprovalBus();
