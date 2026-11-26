import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Briefcase,
  CalendarClock,
  Check,
  LucideAngularModule,
  UserPlus,
  X
} from 'lucide-angular';
import { ActivityItem, DealStage } from '../../core/models/crm.models';
import { CrmService, QuickActionKind } from '../../core/services/crm.service';

@Component({
  selector: 'app-quick-action-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 60;
        background: rgba(0, 0, 0, 0.56);
        backdrop-filter: blur(4px);
        display: grid;
        place-items: center;
        padding: 24px;
      }

      .modal-panel {
        width: 100%;
        max-width: 480px;
        border-radius: var(--radius-panel);
        background: var(--bg-card);
        border: 1px solid var(--hairline-strong);
        box-shadow: var(--shadow-float);
        overflow: hidden;
      }

      .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px;
        border-bottom: 1px solid var(--hairline);

        h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
      }

      .modal-tabs {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        padding: 4px;
        margin: 16px 20px 0;
        border-radius: var(--radius-md);
        background: var(--bg-deep);
        border: 1px solid var(--hairline);
      }

      .modal-tab {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 32px;
        border: 0;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition:
          background-color var(--dur-fast) var(--ease-out-expo),
          color var(--dur-fast) var(--ease-out-expo);

        &.active {
          background: var(--bg-raised);
          color: var(--text-primary);
          box-shadow: var(--top-highlight);
        }
      }

      .modal-body {
        padding: 20px;
        display: grid;
        gap: 14px;
      }

      .field {
        display: grid;
        gap: 6px;

        label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        input,
        select {
          height: 38px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--hairline-strong);
          background: var(--bg-raised);
          color: var(--text-primary);
          font-size: 13.5px;

          &:focus {
            outline: none;
            border-color: var(--accent-1);
          }
        }
      }

      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .modal-foot {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        padding: 16px 20px;
        border-top: 1px solid var(--hairline);
        background: var(--bg-deep);
      }
    `
  ],
  template: `
    @if (crm.quickActionOpen()) {
      <div class="modal-backdrop" (click)="crm.closeQuickAction()">
        <div class="modal-panel animate-modal" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h2>Quick action</h2>
            <button
              type="button"
              class="btn btn-ghost btn-icon btn-sm"
              aria-label="Close quick action"
              (click)="crm.closeQuickAction()"
            >
              <lucide-icon [img]="XIcon" [size]="16" [strokeWidth]="1.5" />
            </button>
          </div>

          <div class="modal-tabs" role="tablist">
            @for (tab of tabs; track tab.id) {
              <button
                type="button"
                role="tab"
                class="modal-tab"
                [class.active]="crm.quickActionTab() === tab.id"
                (click)="crm.quickActionTab.set(tab.id)"
              >
                <lucide-icon [img]="tab.icon" [size]="14" [strokeWidth]="1.5" />
                <span>{{ tab.label }}</span>
              </button>
            }
          </div>

          <form (ngSubmit)="submit()">
            <div class="modal-body">
              @if (crm.quickActionTab() === 'deal') {
                <div class="field">
                  <label for="dealTitle">Deal title</label>
                  <input
                    id="dealTitle"
                    name="dealTitle"
                    type="text"
                    placeholder="Enterprise License Expansion"
                    [(ngModel)]="dealTitle"
                    required
                  />
                </div>
                <div class="field">
                  <label for="dealCompany">Account</label>
                  <input
                    id="dealCompany"
                    name="dealCompany"
                    type="text"
                    placeholder="Northstar Logistics"
                    [(ngModel)]="dealCompany"
                    required
                  />
                </div>
                <div class="field-row">
                  <div class="field">
                    <label for="dealValue">Value (USD)</label>
                    <input
                      id="dealValue"
                      name="dealValue"
                      type="number"
                      min="1000"
                      step="500"
                      [(ngModel)]="dealValue"
                      required
                    />
                  </div>
                  <div class="field">
                    <label for="dealStage">Stage</label>
                    <select id="dealStage" name="dealStage" [(ngModel)]="dealStage">
                      <option value="Discovery">Discovery</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                    </select>
                  </div>
                </div>
              }

              @if (crm.quickActionTab() === 'contact') {
                <div class="field">
                  <label for="contactName">Full name</label>
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    placeholder="Jordan Mercer"
                    [(ngModel)]="contactName"
                    required
                  />
                </div>
                <div class="field-row">
                  <div class="field">
                    <label for="contactCompany">Company</label>
                    <input
                      id="contactCompany"
                      name="contactCompany"
                      type="text"
                      placeholder="Kestrel BioLabs"
                      [(ngModel)]="contactCompany"
                      required
                    />
                  </div>
                  <div class="field">
                    <label for="contactRole">Role</label>
                    <input
                      id="contactRole"
                      name="contactRole"
                      type="text"
                      placeholder="VP Operations"
                      [(ngModel)]="contactRole"
                    />
                  </div>
                </div>
                <div class="field">
                  <label for="contactEmail">Work email</label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    placeholder="jordan@kestrel.bio"
                    [(ngModel)]="contactEmail"
                    required
                  />
                </div>
              }

              @if (crm.quickActionTab() === 'activity') {
                <div class="field">
                  <label for="activityType">Activity type</label>
                  <select id="activityType" name="activityType" [(ngModel)]="activityType">
                    <option value="call">Discovery call</option>
                    <option value="meeting">Executive meeting</option>
                    <option value="email">Proposal follow-up</option>
                  </select>
                </div>
                <div class="field">
                  <label for="activityTitle">Summary</label>
                  <input
                    id="activityTitle"
                    name="activityTitle"
                    type="text"
                    placeholder="Reviewed annual contract terms with procurement"
                    [(ngModel)]="activityTitle"
                    required
                  />
                </div>
                <div class="field">
                  <label for="activityDetail">Notes</label>
                  <input
                    id="activityDetail"
                    name="activityDetail"
                    type="text"
                    placeholder="Next step: legal sign-off by Friday"
                    [(ngModel)]="activityDetail"
                  />
                </div>
              }
            </div>

            <div class="modal-foot">
              <button type="button" class="btn btn-secondary" (click)="crm.closeQuickAction()">
                Cancel
              </button>
              <button type="submit" class="btn btn-accent">
                <lucide-icon [img]="CheckIcon" [size]="15" [strokeWidth]="1.75" />
                <span>Save record</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class QuickActionModalComponent {
  readonly crm = inject(CrmService);

  readonly XIcon = X;
  readonly CheckIcon = Check;

  readonly tabs: { id: QuickActionKind; label: string; icon: typeof Briefcase }[] = [
    { id: 'deal', label: 'New deal', icon: Briefcase },
    { id: 'contact', label: 'Add contact', icon: UserPlus },
    { id: 'activity', label: 'Log activity', icon: CalendarClock }
  ];

  dealTitle = '';
  dealCompany = '';
  dealValue = 45000;
  dealStage: DealStage = 'Qualified';

  contactName = '';
  contactCompany = '';
  contactRole = '';
  contactEmail = '';

  activityType: ActivityItem['type'] = 'call';
  activityTitle = '';
  activityDetail = '';

  submit(): void {
    const tab = this.crm.quickActionTab();
    if (tab === 'deal' && this.dealTitle.trim() && this.dealCompany.trim()) {
      this.crm.addDeal({
        title: this.dealTitle,
        company: this.dealCompany,
        value: this.dealValue,
        stage: this.dealStage
      });
      this.dealTitle = '';
      this.dealCompany = '';
      this.crm.closeQuickAction();
    } else if (tab === 'contact' && this.contactName.trim() && this.contactEmail.trim()) {
      this.crm.addContact({
        name: this.contactName,
        company: this.contactCompany || 'Independent',
        role: this.contactRole,
        email: this.contactEmail
      });
      this.contactName = '';
      this.contactCompany = '';
      this.contactRole = '';
      this.contactEmail = '';
      this.crm.closeQuickAction();
    } else if (tab === 'activity' && this.activityTitle.trim()) {
      this.crm.logActivity({
        type: this.activityType,
        title: this.activityTitle,
        detail: this.activityDetail
      });
      this.activityTitle = '';
      this.activityDetail = '';
      this.crm.closeQuickAction();
    }
  }
}
