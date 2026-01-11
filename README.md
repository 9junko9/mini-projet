# Inventaire IT — Déploiement Kubernetes (Minikube)

## Pré-requis
- Minikube installé
- kubectl installé
- Addon ingress activé

## Démarrage Minikube + Ingress
```bash
minikube start
minikube addons enable ingress
```

## Build des images dans Minikube
```bash
eval "$(minikube docker-env)"

docker build -t inventory-backend:latest ./backend
docker build -t inventory-frontend:latest ./frontend
```

## Déploiement de la stack
```bash
kubectl apply -f k8s
```

## Vérifications rapides
```bash
kubectl get pods -n inventory
kubectl get pvc -n inventory
```

## Accès Ingress
Le host requis est `inventory.local`, donc il faut une résolution DNS. Trois cas :

### Linux natif
```bash
MINIKUBE_IP=$(minikube ip)
echo "$MINIKUBE_IP inventory.local" | sudo tee -a /etc/hosts
```
Ensuite :
- UI : http://inventory.local/
- API : http://inventory.local/api/health

### Windows (sans WSL)
Si Minikube tourne directement sur Windows :
1) Récupérer l’IP Minikube :
```bash
minikube ip
```
2) Ajouter dans le fichier hosts Windows :
```
C:\Windows\System32\drivers\etc\hosts
<IP_MINIKUBE> inventory.local
```
3) Accéder à l’application :
- UI : http://inventory.local/
- API : http://inventory.local/api/health

### WSL (Minikube dans WSL)
Le navigateur Windows ne peut pas joindre directement l’IP Minikube. Utiliser un port-forward.

1) Lancer le port-forward (dans WSL) :
```bash
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
```

2) Ajouter dans le fichier hosts Windows :
```
C:\Windows\System32\drivers\etc\hosts
127.0.0.1 inventory.local
```

3) Accéder à l’application :
- UI : http://inventory.local:8080/
- API : http://inventory.local:8080/api/health

## Tests API
```bash
curl -H "Host: inventory.local" http://127.0.0.1:8080/api/health
```

## Initialisation DB (preuve)
```bash
kubectl exec -n inventory postgres-0 -- psql -U inventory -d inventorydb -c "select * from equipment;"
```

## Arborescence k8s/
- Namespace : `inventory`
- PostgreSQL : StatefulSet + PVC + Secret + init SQL via ConfigMap
- Backend : Deployment + Service + probes + Secret
- Frontend : Deployment + Service (Nginx)
- Ingress : 2 règles (UI / API avec rewrite)
