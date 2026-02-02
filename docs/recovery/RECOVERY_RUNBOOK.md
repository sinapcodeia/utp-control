# 🌪️ Disaster Recovery Runbook: UTP CONTROL
## "Total Restoration Protocol" - Silicon Valley Tier

**Status:** ACTIVE  
**Last Review:** 2026-01-29  
**Security Level:** LEVEL 4 (Mission Critical)

---

## 1. Governance & Standards
This runbook complies with **ISO 22301:2019** and follows the **SRE (Site Reliability Engineering)** principles of Big Tech. 

- **Target RTO:** < 2 hours (Full system rebuild)
- **Target RPO:** < 15 minutes (Database state)

---

## 2. Infrastructure as Code (IaC)
The entire environment is reproducible. In case of a catastrophic failure:

1.  **Platform Rebuild**:
    - Use provided `docker-compose.yml` to provision the environment.
    - Ensure Docker Engine & WSL2 are healthy.
2.  **API Deployment**:
    - Build: `docker compose build --no-cache`
    - Start: `docker compose up -d`

---

## 3. Data Restoration (The Database)
Data is our most valuable asset. The 3-2-1 strategy ensures survival.

### Step-by-Step Recovery:
1.  **Retrieve Archive**: Locate the latest ZIP in `C:\UTP\BACKUPS\`.
2.  **Verify Hash**: 
    ```powershell
    $manifest = Get-Content MANIFEST.json | ConvertFrom-Json
    # Execute the integrity check block in RECOVERY.md
    ```
3.  **Supabase Sync**:
    - If Supabase Cloud is active: Database restoration is handled via PITR (Point-in-Time Recovery).
    - If Local Database:
      ```bash
      # Restore from latest SQL dump
      cat latest_dump.sql | docker exec -i control-db psql -U postgres
      ```

---

## 4. Codebase Restoration
If the primary server is lost:

1.  **Clone Mirror**: 
    ```bash
    git clone --mirror git@github.com:utp-control/control.git
    ```
2.  **Apply Latest Archive**: Unzip the latest backup over the clone to capture uncommitted changes or config files.
3.  **Dependency Rebuild**:
    ```bash
    pnpm clean-install
    pnpm exec prisma generate
    ```

---

## 5. Security Post-Restoration
After a restoration event, the following **Hardening Protocol** must be executed:

- [ ] **Credential Rotation**: Change all database and Supabase secrets.
- [ ] **Audit Log Verification**: Ensure the integrity of the ledger.
- [ ] **Sanity Check**: Execute the `scripts/verify-credentials.ps1` script.
- [ ] **Connectivity Test**: Execute the `docs/CONNECTIVITY_TROUBLESHOOTING.md` steps.

---

## 6. Emergency Contacts
| Role | Channel | Response Time |
|---|---|---|
| Infrastructure Architect | Slack #ops-critical | < 15m |
| Database Admin | PagerDuty [ID-BACKUP] | < 30m |
| Security Lead | Signal [SEC-CONTROL] | < 15m |

---

> *"Hope is not a strategy. Automation is."*
