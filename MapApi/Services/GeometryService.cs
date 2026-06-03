using MapApi.Data;
using MapApi.Dtos;
using MapApi.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;

namespace MapApi.Services
{
    public class GeometryService : IGeometryService
    {
        private readonly AppDbContext _context;
        private readonly GeoJsonWriter _geoJsonWriter = new();
        private readonly GeoJsonReader _geoJsonReader = new();
        public GeometryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<GeometryListDto> CreateAsync(CreateGeometryDto createGeometryDto)
        {
            var geometry = _geoJsonReader.Read<Geometry>(createGeometryDto.GeoJson); //GeoJSON formatındaki veriyi Geometry nesnesine dönüştürmek için GeoJsonReader kullanıyoruz

            geometry.SRID = 4326; //SRID'yi WGS 84 olarak ayarlıyoruz

            var entity = new GeometryEntity
            {
                Name = createGeometryDto.Name,
                Description = createGeometryDto.Description,
                Geometry = geometry,
                CreatedDate = DateTime.UtcNow
            };
            
            _context.Geometries.Add(entity);
            await _context.SaveChangesAsync();

            return new GeometryListDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                GeoJson = _geoJsonWriter.Write(entity.Geometry), //Kaydedilen geometrinin GeoJSON formatında geri dönmesi için GeoJsonWriter kullanıyoruz
                CreatedDate = entity.CreatedDate
            };

        }

        public async Task<List<GeometryListDto>> GetAllAsync()
        {
            var geometries = await _context.Geometries.ToListAsync();

            //veritabanından çekilen her kaydı GeometryListDto'ya dönüştürmek için Select kullanıyoruz
            return geometries.Select(x => new GeometryListDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                GeoJson = _geoJsonWriter.Write(x.Geometry), //Leaflet'in anlayabileceği GeoJSON formatına dönüştürmek için GeoJsonWriter kullanıyoruz
                CreatedDate = x.CreatedDate
            }).ToList();


        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Geometries.FindAsync(id);

            if (entity == null)
            {
                return false;
            }
            _context.Geometries.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateGeometryAsync(int id, UpdateGeometryDto updateGeometryDto)
        {
            var entity = await _context.Geometries.FindAsync(id);
            if (entity == null)
            {
                return false;
            }

            if (updateGeometryDto.Name != null)
            {
                entity.Name = updateGeometryDto.Name;
            }
            if (updateGeometryDto.Description != null)
            {
                entity.Description = updateGeometryDto.Description;
            }

            if (!string.IsNullOrWhiteSpace(updateGeometryDto.GeoJson))
            {
                var geometry = _geoJsonReader.Read<Geometry>(updateGeometryDto.GeoJson); //GeoJSON formatındaki veriyi Geometry nesnesine dönüştürmek için GeoJsonReader kullanıyoruz
                geometry.SRID = 4326;
                entity.Geometry = geometry;
            }
            
            await _context.SaveChangesAsync();

            return true;    
        }
    }
}
