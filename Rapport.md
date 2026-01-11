# Rapport — Projet Kubernetes « Inventaire IT »

## 1. Contexte
Ce projet consiste à conteneuriser une application d’inventaire de matériel IT (Angular + FastAPI + PostgreSQL) et à la déployer sur Minikube en respectant les contraintes suivantes :
- Namespace dédié
- Base PostgreSQL en StatefulSet + PVC + Secret
- Backend en Deployment + probes
- Frontend en Deployment (mode prod) + Nginx
- Ingress avec host `inventory.local` et routage `/` et `/api`
- Sécurisation minimale (DB non exposée, secrets)

## 2. Architecture Kubernetes
- **Namespace** : `inventory`
- **PostgreSQL** : StatefulSet (1 replica), Service ClusterIP, PVC, init SQL via ConfigMap
- **Backend FastAPI** : Deployment + Service ClusterIP, probes `/health`, Secret `DATABASE_URL`
- **Frontend Angular** : build prod + Nginx, Deployment + Service ClusterIP
- **Ingress** : host `inventory.local`, `/` → frontend, `/api` → backend (rewrite)

## 3. Arborescence et manifests
- `k8s/00-namespace.yaml`
- `k8s/10-postgres-secret.yaml`
- `k8s/11-postgres-init-configmap.yaml`
- `k8s/12-postgres-statefulset.yaml`
- `k8s/20-backend-secret.yaml`
- `k8s/21-backend-deployment.yaml`
- `k8s/30-frontend-deployment.yaml`
- `k8s/40-ingress.yaml`

## 4. Étapes de déploiement
### 4.1 Démarrage Minikube et ingress
```bash
minikube start
minikube addons enable ingress
```

### 4.2 Build des images dans l’environnement Minikube
```bash
eval "$(minikube docker-env)"

docker build -t inventory-backend:latest ./backend
docker build -t inventory-frontend:latest ./frontend
```

### 4.3 Déploiement des manifests
```bash
kubectl apply -f k8s
```

### 4.4 Vérifications
```bash
kubectl get pods -n inventory
kubectl get pvc -n inventory
```

## 5. Accès à l’application (résolution du host)
Le host requis est `inventory.local`. Trois cas :

### Linux natif
```bash
MINIKUBE_IP=$(minikube ip)
echo "$MINIKUBE_IP inventory.local" | sudo tee -a /etc/hosts
```
Accès :
- UI : http://inventory.local/
- API : http://inventory.local/api/health

### Windows (sans WSL)
1) Récupérer l’IP Minikube :
```bash
minikube ip
```
2) Ajouter dans le fichier hosts Windows :
```
C:\Windows\System32\drivers\etc\hosts
<IP_MINIKUBE> inventory.local
```
3) Accès :
- UI : http://inventory.local/
- API : http://inventory.local/api/health

### WSL (Minikube dans WSL)
Le navigateur Windows ne peut pas joindre directement l’IP Minikube. Utiliser un port-forward.

```bash
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
```

Ajouter dans `C:\Windows\System32\drivers\etc\hosts` :
```
127.0.0.1 inventory.local
```

Accès :
- UI : http://inventory.local:8080/
- API : http://inventory.local:8080/api/health

## 6. Tests fonctionnels
- **API** :
```bash
curl -H "Host: inventory.local" http://127.0.0.1:8080/api/health
```
- **DB init** :
```bash
kubectl exec -n inventory postgres-0 -- psql -U inventory -d inventorydb -c "select * from equipment;"
```

## 7. Résultats
- Tous les pods sont en `Running`.
- Le PVC PostgreSQL est `Bound`.
- L’API répond correctement via l’Ingress.
- L’UI est accessible et permet de visualiser et gérer l’inventaire.

## 8. Captures d’écran à insérer
1) `minikube status` + `minikube addons list` (ingress activé)
2) `kubectl get pods -n inventory`
3) `kubectl get pvc -n inventory`
4) Preuve init DB (`select * from equipment`)
5) API OK (`/api/health`)
6) UI fonctionnelle (liste des équipements)
7) `kubectl get ingress -n inventory`

## 9. Conclusion
Le déploiement respecte les contraintes imposées : séparation par namespace, persistance des données, configuration via Secrets/ConfigMaps, exposition via Ingress, et validation du fonctionnement bout‑à‑bout.
