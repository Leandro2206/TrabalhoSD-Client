import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Categoria } from './categoria';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  readonly url = 'http://localhost:3000/categorias';

  private categoriaSubject$:
    BehaviorSubject<Categoria[]> = new BehaviorSubject<Categoria[]>(null);
  private loaded: boolean = false;

  constructor(private http: HttpClient) { }

  get(): Observable<Categoria[]> {
    if (!this.loaded) {
      this.http.get<Categoria[]>(this.url)
        .pipe(
          tap((categs) => console.log(categs)))
        .subscribe(this.categoriaSubject$);
      this.loaded = true;
    }
    return this.categoriaSubject$.asObservable();
  }

  add(c: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, c)
      .pipe(
        tap((categ: Categoria) => this.categoriaSubject$.getValue().push(categ))
      )
  }

  update(categ: Categoria): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.url}/${categ._id}`, categ)
      .pipe(
        tap((c) => {
          let categorias = this.categoriaSubject$.getValue();
          let i = categorias.findIndex(c => c._id === categ._id);
          if (i >= 0)
            categorias[i].nome = c.nome;
        })
      )
  }

  del(categ: Categoria): Observable<any> {
    return this.http.delete(`${this.url}/${categ._id}`)
      .pipe(
        tap(() => {
          let categorias = this.categoriaSubject$.getValue();
          let i = categorias.findIndex(c => c._id === categ._id);
          if (i >= 0)
            categorias.splice(i, 1);
        })
      )
  }
}