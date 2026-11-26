import { Component, inject } from '@angular/core';
import { LucideAngularModule, Mail, Phone, Plus } from 'lucide-angular';
import { CrmService } from '../../core/services/crm.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [LucideAngularModule],
  styles: [
    `
      .contacts-page {
        display: grid;
        gap: 20px;
      }

      .page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }

      .page-meta {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .page-title {
        margin: 0;
        font-size: 28px;
        font-weight: 500;
        letter-spacing: -0.02em;
      }

      .contacts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .contact-card {
        padding: 20px;
        border-radius: var(--radius-lg);
        background: var(--bg-card);
        border: 1px solid var(--hairline);
        display: grid;
        gap: 14px;
        transition: border-color var(--dur-fast) var(--ease-out-expo);

        &:hover {
          border-color: var(--hairline-strong);
        }
      }

      .contact-top {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--bg-raised);
        border: 1px solid var(--hairline-strong);
        display: grid;
        place-items: center;
        font-size: 13px;
        font-weight: 600;
      }

      .contact-name {
        font-size: 15px;
        font-weight: 500;
      }

      .contact-role {
        font-size: 12.5px;
        color: var(--text-muted);
      }

      .contact-meta {
        display: grid;
        gap: 6px;
        font-size: 13px;
        color: var(--text-secondary);
      }

      .meta-line {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .contact-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 12px;
        border-top: 1px solid var(--hairline);
        font-size: 12px;
      }
    `
  ],
  template: `
    <div class="contacts-page">
      <div class="page-head animate-enter">
        <div>
          <div class="page-meta mono">{{ crm.filteredContacts().length }} contacts</div>
          <h1 class="page-title">Accounts & Contacts</h1>
        </div>

        <button type="button" class="btn btn-accent btn-sm" (click)="crm.openQuickAction('contact')">
          <lucide-icon [img]="PlusIcon" [size]="15" [strokeWidth]="2" />
          <span>Add contact</span>
        </button>
      </div>

      <div class="contacts-grid animate-enter stagger-1">
        @for (contact of crm.filteredContacts(); track contact.id) {
          <article class="contact-card">
            <div class="contact-top">
              <div class="avatar">{{ contact.initials }}</div>
              <div>
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-role">{{ contact.role }} · {{ contact.company }}</div>
              </div>
            </div>

            <div class="contact-meta">
              <div class="meta-line">
                <lucide-icon [img]="MailIcon" [size]="14" [strokeWidth]="1.5" style="color: var(--text-muted)" />
                <span>{{ contact.email }}</span>
              </div>
              <div class="meta-line">
                <lucide-icon [img]="PhoneIcon" [size]="14" [strokeWidth]="1.5" style="color: var(--text-muted)" />
                <span class="mono">{{ contact.phone }}</span>
              </div>
            </div>

            <div class="contact-foot">
              <span style="color: var(--text-muted)">Last touch {{ contact.lastTouch }}</span>
              <span class="mono" style="color: var(--text-primary)">
                {{ crm.formatCurrency(contact.ltv) }} LTV
              </span>
            </div>
          </article>
        }
      </div>
    </div>
  `
})
export class ContactsComponent {
  readonly crm = inject(CrmService);
  readonly PlusIcon = Plus;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
}
